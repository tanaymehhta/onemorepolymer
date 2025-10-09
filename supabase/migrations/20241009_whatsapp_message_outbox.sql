-- Enhanced Message Outbox Table for WhatsApp Integration
-- This migration creates/enhances the message_outbox table with comprehensive error tracking,
-- retry logic, and monitoring capabilities for WhatsApp Business API integration

-- Create message_outbox table if it doesn't exist, or enhance it if it does
CREATE TABLE IF NOT EXISTS message_outbox (
  -- Primary identifiers
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL,

  -- Message details
  platform VARCHAR(20) NOT NULL DEFAULT 'whatsapp',
  recipient_phone VARCHAR(20) NOT NULL,
  recipient_role VARCHAR(20) NOT NULL CHECK (recipient_role IN ('accounts', 'logistics', 'boss1', 'bossog')),
  message_text TEXT NOT NULL,

  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'read', 'failed', 'dead_letter')),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,

  -- Error tracking
  error_type VARCHAR(50), -- AUTH_ERROR, RATE_LIMIT, INVALID_RECIPIENT, NETWORK_ERROR, etc.
  error_message TEXT,
  error_details JSONB, -- Additional error context and debugging info

  -- Timing information
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  next_retry_at TIMESTAMPTZ,

  -- External API response data
  external_message_id VARCHAR(100), -- WhatsApp message ID from Meta API
  api_response JSONB, -- Full API response for debugging

  -- Performance metrics
  response_time_ms INTEGER, -- Time taken for API call
  wait_time_ms INTEGER, -- Time spent waiting due to rate limiting

  -- Metadata
  created_by VARCHAR(100) DEFAULT 'system',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add columns if they don't exist (for existing tables)
DO $$
BEGIN
  -- Add error_details column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_outbox' AND column_name = 'error_details') THEN
    ALTER TABLE message_outbox ADD COLUMN error_details JSONB;
  END IF;

  -- Add response_time_ms column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_outbox' AND column_name = 'response_time_ms') THEN
    ALTER TABLE message_outbox ADD COLUMN response_time_ms INTEGER;
  END IF;

  -- Add wait_time_ms column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_outbox' AND column_name = 'wait_time_ms') THEN
    ALTER TABLE message_outbox ADD COLUMN wait_time_ms INTEGER;
  END IF;

  -- Add read_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_outbox' AND column_name = 'read_at') THEN
    ALTER TABLE message_outbox ADD COLUMN read_at TIMESTAMPTZ;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_outbox' AND column_name = 'updated_at') THEN
    ALTER TABLE message_outbox ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_outbox' AND column_name = 'created_by') THEN
    ALTER TABLE message_outbox ADD COLUMN created_by VARCHAR(100) DEFAULT 'system';
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_outbox_status ON message_outbox(status);
CREATE INDEX IF NOT EXISTS idx_message_outbox_deal_id ON message_outbox(deal_id);
CREATE INDEX IF NOT EXISTS idx_message_outbox_platform ON message_outbox(platform);
CREATE INDEX IF NOT EXISTS idx_message_outbox_recipient_role ON message_outbox(recipient_role);
CREATE INDEX IF NOT EXISTS idx_message_outbox_created_at ON message_outbox(created_at);
CREATE INDEX IF NOT EXISTS idx_message_outbox_retry ON message_outbox(next_retry_at) WHERE status = 'failed';
CREATE INDEX IF NOT EXISTS idx_message_outbox_error_type ON message_outbox(error_type) WHERE error_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_message_outbox_external_id ON message_outbox(external_message_id) WHERE external_message_id IS NOT NULL;

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_message_outbox_deal_status ON message_outbox(deal_id, status);
CREATE INDEX IF NOT EXISTS idx_message_outbox_status_created ON message_outbox(status, created_at);
CREATE INDEX IF NOT EXISTS idx_message_outbox_platform_status ON message_outbox(platform, status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_message_outbox_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_message_outbox_updated_at ON message_outbox;

-- Create trigger for updated_at
CREATE TRIGGER trigger_message_outbox_updated_at
  BEFORE UPDATE ON message_outbox
  FOR EACH ROW
  EXECUTE FUNCTION update_message_outbox_updated_at();

-- Create function to get messages pending retry
CREATE OR REPLACE FUNCTION get_messages_pending_retry()
RETURNS TABLE (
  id UUID,
  deal_id UUID,
  recipient_phone VARCHAR(20),
  recipient_role VARCHAR(20),
  message_text TEXT,
  attempts INTEGER,
  error_type VARCHAR(50),
  error_message TEXT,
  next_retry_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mo.id,
    mo.deal_id,
    mo.recipient_phone,
    mo.recipient_role,
    mo.message_text,
    mo.attempts,
    mo.error_type,
    mo.error_message,
    mo.next_retry_at
  FROM message_outbox mo
  WHERE mo.status = 'failed'
    AND mo.attempts < mo.max_attempts
    AND mo.next_retry_at <= NOW()
  ORDER BY mo.next_retry_at ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get message statistics
CREATE OR REPLACE FUNCTION get_message_statistics(
  p_hours_back INTEGER DEFAULT 24
)
RETURNS TABLE (
  total_messages BIGINT,
  successful_messages BIGINT,
  failed_messages BIGINT,
  pending_messages BIGINT,
  dead_letter_messages BIGINT,
  success_rate NUMERIC,
  avg_response_time_ms NUMERIC,
  total_wait_time_ms BIGINT,
  error_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status IN ('sent', 'delivered', 'read')) as successful,
      COUNT(*) FILTER (WHERE status = 'failed') as failed,
      COUNT(*) FILTER (WHERE status IN ('pending', 'sending')) as pending,
      COUNT(*) FILTER (WHERE status = 'dead_letter') as dead_letter,
      AVG(response_time_ms) as avg_response,
      SUM(wait_time_ms) as total_wait,
      jsonb_object_agg(
        COALESCE(error_type, 'SUCCESS'),
        COUNT(*)
      ) FILTER (WHERE error_type IS NOT NULL OR status IN ('sent', 'delivered', 'read')) as errors
    FROM message_outbox
    WHERE created_at >= NOW() - (p_hours_back || ' hours')::INTERVAL
  )
  SELECT
    s.total,
    s.successful,
    s.failed,
    s.pending,
    s.dead_letter,
    CASE
      WHEN s.total > 0 THEN ROUND((s.successful::NUMERIC / s.total) * 100, 2)
      ELSE 0
    END,
    ROUND(s.avg_response, 2),
    s.total_wait,
    s.errors
  FROM stats s;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean old messages (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_messages(
  p_days_to_keep INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete old successful messages
  DELETE FROM message_outbox
  WHERE status IN ('delivered', 'read')
    AND created_at < NOW() - (p_days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Log the cleanup
  INSERT INTO message_outbox (
    deal_id,
    platform,
    recipient_phone,
    recipient_role,
    message_text,
    status,
    created_by
  ) VALUES (
    gen_random_uuid(),
    'system',
    'system',
    'accounts',
    'Cleanup completed: deleted ' || deleted_count || ' old messages',
    'sent',
    'cleanup_function'
  );

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create view for monitoring dashboard
CREATE OR REPLACE VIEW message_outbox_monitoring AS
SELECT
  mo.id,
  mo.deal_id,
  mo.platform,
  mo.recipient_role,
  mo.status,
  mo.attempts,
  mo.max_attempts,
  mo.error_type,
  mo.created_at,
  mo.sent_at,
  mo.delivered_at,
  mo.response_time_ms,
  mo.wait_time_ms,
  -- Calculate time since creation
  EXTRACT(EPOCH FROM (NOW() - mo.created_at))::INTEGER as seconds_since_created,
  -- Calculate next retry countdown
  CASE
    WHEN mo.status = 'failed' AND mo.next_retry_at > NOW() THEN
      EXTRACT(EPOCH FROM (mo.next_retry_at - NOW()))::INTEGER
    ELSE 0
  END as seconds_until_retry,
  -- Add urgency flag
  CASE
    WHEN mo.status = 'failed' AND mo.attempts >= mo.max_attempts THEN 'DEAD_LETTER'
    WHEN mo.status = 'failed' AND mo.next_retry_at <= NOW() THEN 'RETRY_NOW'
    WHEN mo.status = 'pending' AND mo.created_at < NOW() - INTERVAL '5 minutes' THEN 'STUCK'
    WHEN mo.status = 'sending' AND mo.created_at < NOW() - INTERVAL '2 minutes' THEN 'TIMEOUT'
    ELSE 'NORMAL'
  END as urgency
FROM message_outbox mo
WHERE mo.created_at >= NOW() - INTERVAL '7 days'
ORDER BY mo.created_at DESC;

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE ON message_outbox TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_messages_pending_retry() TO your_app_user;
-- GRANT EXECUTE ON FUNCTION get_message_statistics(INTEGER) TO your_app_user;
-- GRANT SELECT ON message_outbox_monitoring TO your_monitoring_user;

-- Insert sample data for testing (remove in production)
INSERT INTO message_outbox (
  deal_id,
  platform,
  recipient_phone,
  recipient_role,
  message_text,
  status,
  created_by
) VALUES (
  gen_random_uuid(),
  'whatsapp',
  '+1234567890',
  'accounts',
  'WhatsApp integration test message - migration completed successfully',
  'sent',
  'migration_script'
) ON CONFLICT DO NOTHING;

-- Create comment on table
COMMENT ON TABLE message_outbox IS 'Enhanced message outbox for WhatsApp Business API integration with comprehensive error tracking, retry logic, and monitoring capabilities';

-- Add comments on key columns
COMMENT ON COLUMN message_outbox.error_details IS 'JSON object containing detailed error information for debugging';
COMMENT ON COLUMN message_outbox.api_response IS 'Full response from WhatsApp API for audit and debugging';
COMMENT ON COLUMN message_outbox.response_time_ms IS 'Time taken for API call in milliseconds';
COMMENT ON COLUMN message_outbox.wait_time_ms IS 'Time spent waiting due to rate limiting in milliseconds';
COMMENT ON COLUMN message_outbox.next_retry_at IS 'Timestamp when this message should be retried (if failed)';

-- Migration completed successfully
SELECT 'WhatsApp message_outbox table migration completed successfully' as result;