BEGIN;
SELECT plan(4);

SELECT has_column(
  'public',
  'events',
  'guest_experience',
  'events distinguish web upload and iOS experiences'
);

SELECT col_not_null(
  'public',
  'events',
  'guest_experience',
  'every event has a guest experience'
);

SELECT has_column(
  'public',
  'events',
  'max_total_photos',
  'events have a total photo cost guard'
);

SELECT col_not_null(
  'public',
  'events',
  'max_total_photos',
  'every event has a total photo limit'
);

SELECT * FROM finish();
ROLLBACK;
