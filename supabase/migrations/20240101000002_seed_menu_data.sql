-- Seeding data from user provided list
TRUNCATE products RESTART IDENTITY;

INSERT INTO products (name, description, price, image_url, category, stock_status)
VALUES
  -- Ready to Drink
  (
    'BeatBox',
    'Party punch in a box. Fruity, fun, and ready to fiesta.',
    8,
    '/images/beatbox.png',
    'Ready to Drink',
    'in_stock'
  ),
  (
    'Buzzballz',
    'Premixed cocktail in a ball. Portable party power.',
    6,
    '/images/buzzball.png',
    'Ready to Drink',
    'in_stock'
  ),
  (
    'White Claw',
    'Light and refreshing hard seltzer. Low carb, big flavor.',
    5,
    '/images/whiteclaw.png',
    'Ready to Drink',
    'in_stock'
  ),

  -- Cervezas
  (
    'Modelo Negra',
    'A rich, full-flavored Munich Dunkel style lager.',
    6,
    '/images/modelo-negra.png',
    'Cervezas',
    'in_stock'
  ),
  (
    'Victoria',
    'Classic Vienna-style lager with amber hues.',
    6,
    '/images/victoria.png',
    'Cervezas',
    'in_stock'
  ),
  (
    'Pacifico Clara',
    'Crisp, refreshing pilsner.',
    6,
    '/images/pacifico-clara.png',
    'Cervezas',
    'out_of_stock'
  );
