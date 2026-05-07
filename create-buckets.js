const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBuckets() {
  try {
    // Create assignment-files bucket
    const { data: filesBucket, error: filesError } = await supabase.storage.createBucket(
      'assignment-files',
      { public: true }
    );

    if (filesError && filesError.message !== 'Bucket already exists') {
      console.error('Error creating assignment-files bucket:', filesError);
    } else {
      console.log('✓ assignment-files bucket ready');
    }

    // Create assignment-submissions bucket
    const { data: submissionsBucket, error: submissionsError } = await supabase.storage.createBucket(
      'assignment-submissions',
      { public: false }
    );

    if (submissionsError && submissionsError.message !== 'Bucket already exists') {
      console.error('Error creating assignment-submissions bucket:', submissionsError);
    } else {
      console.log('✓ assignment-submissions bucket ready');
    }

    console.log('\n✓ Storage buckets configured successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

createBuckets();
