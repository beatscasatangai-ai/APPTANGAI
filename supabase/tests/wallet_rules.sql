do $$
declare
  v_case record;
begin
  for v_case in
    select * from (values
      (0.01::numeric, 1::bigint),
      (4.99::numeric, 499::bigint),
      (5.00::numeric, 550::bigint),
      (9.99::numeric, 1099::bigint),
      (10.00::numeric, 1200::bigint),
      (19.99::numeric, 2399::bigint),
      (20.00::numeric, 2600::bigint),
      (40.00::numeric, 5200::bigint),
      (50.00::numeric, 6500::bigint),
      (50.01::numeric, 7502::bigint)
    ) as cases (amount_eur, expected_points)
  loop
    if public.calculate_donation_points(v_case.amount_eur)
       is distinct from v_case.expected_points then
      raise exception 'Unexpected points for donation %: expected %',
        v_case.amount_eur, v_case.expected_points;
    end if;
  end loop;

  for v_case in
    select amount_eur
    from (values
      (null::numeric),
      (0::numeric),
      (-1::numeric),
      (1.001::numeric)
    ) as invalid_amounts (amount_eur)
  loop
    begin
      perform public.calculate_donation_points(v_case.amount_eur);
      raise exception using
        errcode = 'P0001',
        message = format('Expected donation %s to be rejected', v_case.amount_eur);
    exception
      when sqlstate '22023' then
        null;
    end;
  end loop;
end;
$$;
