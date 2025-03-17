-- create an entry in user_meta whenever a new user is created
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
INSERT INTO user_meta (id, email)
VALUES (
  NEW.id,
  NEW.email
);
  return new;
end;
$$;

-- trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
----