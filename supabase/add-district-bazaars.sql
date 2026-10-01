-- Bazaars for the six districts that had none (Nagar, Kharmang, Roundu, Astore, Ghizer, Diamer).
-- Run once in Supabase → SQL Editor. Safe to re-run: existing slugs are skipped.
insert into public.bazaars (slug, name, district, town, description, image_url, highlights, shop_count, product_count, new_today) values
  ('nagar-bazaar', 'Nagar Bazaar', 'nagar', 'Nagar Khas', 'Nagar''s main market — Hopar honey, dried mulberries and apricots from the glacier villages.', 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=1000&q=80', array['Hopar honey', 'Mulberries', 'Apricots']::text[], 19, 214, 5),
  ('tolti-bazaar', 'Tolti Bazaar', 'kharmang', 'Tolti', 'Kharmang''s roadside market on the Indus — apricots, apricot oil and daily goods.', 'https://images.unsplash.com/photo-1631815333332-e3ffb24e2bf8?auto=format&fit=crop&w=1000&q=80', array['Apricots', 'Apricot oil', 'Daily goods']::text[], 11, 96, 2),
  ('dambudas-bazaar', 'Dambudas Bazaar', 'roundu', 'Dambudas', 'Roundu''s stop on the Skardu road — dried mulberries, apricots and farm supplies.', 'https://images.unsplash.com/photo-1756363815508-a581ac3a1fee?auto=format&fit=crop&w=1000&q=80', array['Mulberries', 'Apricots', 'Farm supplies']::text[], 9, 88, 2),
  ('eidgah-bazaar', 'Eidgah Bazaar', 'astore', 'Eidgah', 'Astore''s main bazaar — livestock, potatoes and desi ghee from Rama and Rattu.', 'https://images.unsplash.com/photo-1554755209-85e44182e019?auto=format&fit=crop&w=1000&q=80', array['Livestock', 'Potatoes', 'Desi ghee']::text[], 22, 260, 7),
  ('gahkuch-bazaar', 'Gahkuch Bazaar', 'ghizer', 'Gahkuch', 'Ghizer''s district market — potatoes, cloth, hardware and daily goods for the valleys.', 'https://images.unsplash.com/photo-1623428453655-44feea11454b?auto=format&fit=crop&w=1000&q=80', array['Potatoes', 'Cloth', 'Hardware']::text[], 26, 302, 8),
  ('chilas-bazaar', 'Chilas Bazaar', 'diamer', 'Chilas', 'Diamer''s market on the Karakoram Highway — vehicles, wholesale goods and cloth.', 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=1000&q=80', array['Vehicles', 'Wholesale', 'Cloth']::text[], 34, 420, 11)
on conflict (slug) do nothing;

select slug, name, district from public.bazaars order by district;
