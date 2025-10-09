
// Function definition
exports.get_deals_count = {
  type: 'function',
  function: {
    name: 'getDealsCount',
    description: 'Get the total count of deals from the deals_united table',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

// Function definition for recent deals
exports.get_recent_deals = {
  type: 'function',
  function: {
    name: 'getRecentDeals',
    description: 'Get the 5 most recent deals from deals_united table',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
};

// Associated functions
exports.getDealsCount = async (args) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { count, error } = await supabase
      .from('deals_united')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return `Total deals in database: ${count}`;
  } catch (error) {
    return `Error fetching deals count: ${error.message}`;
  }
};

exports.getRecentDeals = async (args) => {
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase
      .from('deals_united')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return `Recent deals: ${JSON.stringify(data, null, 2)}`;
  } catch (error) {
    return `Error fetching recent deals: ${error.message}`;
  }
};
