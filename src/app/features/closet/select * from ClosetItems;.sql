select * from ClosetItems;

-- To add test data, insert a few ClosetItems for a known playerId (use a valid GUID).
INSERT INTO ClosetItems (Id, PlayerId, Name, Type, Rarity, ImageUrl)
VALUES
  (NEWID(), 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Red Shirt', 'Shirt', 'Common', 'shirt-red.png'),
  (NEWID(), 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Blue Jeans', 'Pants', 'Rare', 'jeans-blue.png'),
  (NEWID(), 'c56a4180-65aa-42ec-a945-5fd21dec0538', 'Sneakers', 'Shoes', 'Common', 'sneakers.png');