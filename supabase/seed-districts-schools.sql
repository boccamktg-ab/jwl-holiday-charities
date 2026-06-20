-- Seed districts and schools
-- Run in Supabase SQL Editor

do $$
declare
  d_huntington uuid;
  d_harborfields uuid;
  d_south_huntington uuid;
  d_elwood uuid;
  d_northport uuid;
  d_half_hollow uuid;
begin

  insert into districts (name) values ('Huntington Union Free School District') returning id into d_huntington;
  insert into districts (name) values ('Harborfields Central School District') returning id into d_harborfields;
  insert into districts (name) values ('South Huntington Union Free School District') returning id into d_south_huntington;
  insert into districts (name) values ('Elwood Union Free School District') returning id into d_elwood;
  insert into districts (name) values ('Northport-East Northport Union Free School District') returning id into d_northport;
  insert into districts (name) values ('Half Hollow Hills Central School District') returning id into d_half_hollow;

  -- Huntington UFSD
  insert into schools (district_id, name) values
    (d_huntington, 'Huntington High School'),
    (d_huntington, 'J. Taylor Finley Middle School'),
    (d_huntington, 'Woodhull Intermediate School'),
    (d_huntington, 'Jack Abrams STEM Magnet School'),
    (d_huntington, 'Flower Hill Primary School'),
    (d_huntington, 'Jefferson Primary School'),
    (d_huntington, 'Southdown Primary School'),
    (d_huntington, 'Washington Primary School');

  -- Harborfields CSD
  insert into schools (district_id, name) values
    (d_harborfields, 'Harborfields High School'),
    (d_harborfields, 'Oldfield Middle School'),
    (d_harborfields, 'Thomas J. Lahey Elementary School'),
    (d_harborfields, 'Washington Drive Primary School');

  -- South Huntington UFSD
  insert into schools (district_id, name) values
    (d_south_huntington, 'Walt Whitman High School'),
    (d_south_huntington, 'Henry L. Stimson Middle School'),
    (d_south_huntington, 'Silas Wood 6th Grade Center'),
    (d_south_huntington, 'Birchwood Intermediate School'),
    (d_south_huntington, 'Maplewood Intermediate School'),
    (d_south_huntington, 'Oakwood Primary Center'),
    (d_south_huntington, 'Countrywood Primary Center');

  -- Elwood UFSD
  insert into schools (district_id, name) values
    (d_elwood, 'Elwood-John H. Glenn High School'),
    (d_elwood, 'Elwood Middle School'),
    (d_elwood, 'James H. Boyd Intermediate School'),
    (d_elwood, 'Harley Avenue Primary School');

  -- Northport-East Northport UFSD
  insert into schools (district_id, name) values
    (d_northport, 'Northport Senior High School'),
    (d_northport, 'Northport Middle School'),
    (d_northport, 'East Northport Middle School'),
    (d_northport, 'Fifth Avenue Elementary School'),
    (d_northport, 'Norwood Avenue School'),
    (d_northport, 'Ocean Avenue School'),
    (d_northport, 'Pulaski Road School');

  -- Half Hollow Hills CSD
  insert into schools (district_id, name) values
    (d_half_hollow, 'Half Hollow Hills High School East'),
    (d_half_hollow, 'Half Hollow Hills High School West'),
    (d_half_hollow, 'Candlewood Middle School'),
    (d_half_hollow, 'West Hollow Middle School'),
    (d_half_hollow, 'Otsego Elementary School'),
    (d_half_hollow, 'Paumanok Elementary School'),
    (d_half_hollow, 'Signal Hill Elementary School'),
    (d_half_hollow, 'Sunquam Elementary School'),
    (d_half_hollow, 'Vanderbilt Elementary School');

end $$;
