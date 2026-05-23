from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import List

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage


@dataclass
class ProductSeed:
    name: str
    brand: str
    price: Decimal
    mrp: Decimal
    rating: Decimal
    rating_count: int
    stock: int
    assured: bool
    description: str
    image_seeds: List[str] = field(default_factory=list)


CATEGORIES = [
    ("Mobiles", "mobiles", "https://rukminim2.flixcart.com/flap/128/128/image/22fddf3c7da4c4f4.png"),
    ("Electronics", "electronics", "https://rukminim2.flixcart.com/flap/128/128/image/69c6589653afdb9a.png"),
    ("Fashion", "fashion", "https://rukminim2.flixcart.com/flap/128/128/image/c12afc017e6f24cb.png"),
    ("Home", "home", "https://rukminim2.flixcart.com/flap/128/128/image/ab7e2b022a4587dd.jpg"),
    ("Appliances", "appliances", "https://rukminim2.flixcart.com/flap/128/128/image/0ff199d1bd27eb98.png"),
]


PRODUCTS_BY_CATEGORY: dict[str, List[ProductSeed]] = {
    "mobiles": [
        ProductSeed("Samsung Galaxy M14 5G (Smoky Teal, 128 GB)", "Samsung",
                    Decimal("11499"), Decimal("15499"), Decimal("4.2"), 38421, 47, True,
                    "6.6-inch FHD+ display, 50MP triple camera, 6000mAh battery, Exynos 1330 processor.",
                    ["m14-1", "m14-2", "m14-3"]),
        ProductSeed("Redmi 13C (Stardust Black, 4GB RAM, 128 GB Storage)", "Redmi",
                    Decimal("8499"), Decimal("11999"), Decimal("4.3"), 91204, 120, True,
                    "6.74-inch HD+ 90Hz display, 50MP camera, MediaTek Helio G85, 5000mAh battery.",
                    ["redmi13c-1", "redmi13c-2", "redmi13c-3"]),
        ProductSeed("Realme Narzo 60 5G (Cosmic Black, 8 GB RAM, 128 GB)", "Realme",
                    Decimal("15499"), Decimal("18999"), Decimal("4.4"), 12891, 23, True,
                    "Dimensity 6020 5G, 120Hz Super AMOLED, 64MP camera, 33W SUPERVOOC charging.",
                    ["narzo60-1", "narzo60-2", "narzo60-3"]),
        ProductSeed("Apple iPhone 13 (Midnight, 128 GB)", "Apple",
                    Decimal("49999"), Decimal("59900"), Decimal("4.7"), 254300, 8, True,
                    "A15 Bionic chip, 6.1-inch Super Retina XDR display, dual 12MP camera system.",
                    ["iphone13-1", "iphone13-2", "iphone13-3"]),
        ProductSeed("OnePlus Nord CE 4 (Celadon Marble, 8 GB RAM, 128 GB Storage)", "OnePlus",
                    Decimal("24999"), Decimal("26999"), Decimal("4.3"), 4521, 31, True,
                    "Snapdragon 7 Gen 3, 100W SUPERVOOC, 5500mAh battery, 120Hz AMOLED.",
                    ["nordce4-1", "nordce4-2", "nordce4-3"]),
        ProductSeed("Vivo Y28 5G (Crystal Purple, 6 GB RAM, 128 GB)", "Vivo",
                    Decimal("14499"), Decimal("17499"), Decimal("4.1"), 8742, 64, False,
                    "Dimensity 6020 5G, 50MP camera, 6000mAh battery, 6.68-inch display.",
                    ["vivoy28-1", "vivoy28-2"]),
        ProductSeed("Motorola Moto G54 5G (Pearl Blue, 8 GB RAM, 128 GB)", "Motorola",
                    Decimal("13999"), Decimal("17999"), Decimal("4.3"), 16234, 52, True,
                    "Dimensity 7020, 6.5-inch FHD+ 120Hz, 6000mAh battery, stock Android.",
                    ["motog54-1", "motog54-2", "motog54-3"]),
        ProductSeed("Poco X6 Pro 5G (Black, 8 GB RAM, 256 GB Storage)", "Poco",
                    Decimal("26999"), Decimal("29999"), Decimal("4.4"), 22301, 4, True,
                    "Dimensity 8300-Ultra, 1.5K Flow AMOLED, 64MP OIS camera, 67W turbo charging.",
                    ["pocox6-1", "pocox6-2", "pocox6-3"]),
    ],
    "electronics": [
        ProductSeed("boAt Rockerz 450 Bluetooth On-Ear Headphones", "boAt",
                    Decimal("1299"), Decimal("3990"), Decimal("4.1"), 184522, 200, True,
                    "40mm drivers, 15-hour playback, padded ear cushions, BT 5.0, mic for calls.",
                    ["boat450-1", "boat450-2"]),
        ProductSeed("JBL Tune 510BT Wireless On-Ear Headphones", "JBL",
                    Decimal("2499"), Decimal("4999"), Decimal("4.3"), 51234, 88, True,
                    "JBL Pure Bass Sound, 40-hour battery, multi-point connection, USB-C.",
                    ["jbl510-1", "jbl510-2"]),
        ProductSeed("Sony WH-1000XM4 Wireless Noise Cancelling Headphones", "Sony",
                    Decimal("19990"), Decimal("29990"), Decimal("4.6"), 28411, 12, True,
                    "Industry-leading active noise cancellation, 30-hour battery, multipoint pairing.",
                    ["sony1000xm4-1", "sony1000xm4-2", "sony1000xm4-3"]),
        ProductSeed("Logitech MX Master 3S Wireless Mouse", "Logitech",
                    Decimal("8495"), Decimal("10995"), Decimal("4.7"), 9342, 38, True,
                    "8K DPI sensor, near-silent clicks, USB-C, multi-device, Bolt/Bluetooth.",
                    ["mxmaster3s-1", "mxmaster3s-2"]),
        ProductSeed("HP Pavilion 15 Intel Core i5 12th Gen Laptop", "HP",
                    Decimal("54990"), Decimal("68990"), Decimal("4.2"), 1842, 6, True,
                    "i5-1235U, 16GB DDR4, 512GB SSD, 15.6-inch FHD IPS, Windows 11, backlit keyboard.",
                    ["hppavilion-1", "hppavilion-2", "hppavilion-3"]),
        ProductSeed("Apple Watch SE (2nd Gen) GPS 40mm", "Apple",
                    Decimal("24900"), Decimal("29900"), Decimal("4.6"), 12422, 19, True,
                    "Crash detection, sleep tracking, ECG, fitness coaching, S8 SiP.",
                    ["watchse2-1", "watchse2-2"]),
        ProductSeed("Noise ColorFit Pro 4 Smartwatch", "Noise",
                    Decimal("1799"), Decimal("5999"), Decimal("4.0"), 42190, 110, False,
                    "1.72-inch HD display, Bluetooth calling, 100+ sports modes, IP68.",
                    ["noisepro4-1", "noisepro4-2"]),
    ],
    "fashion": [
        ProductSeed("Roadster Men's Pure Cotton Round Neck T-Shirt", "Roadster",
                    Decimal("399"), Decimal("999"), Decimal("4.2"), 23021, 250, False,
                    "100% pure cotton, regular fit, half sleeves, machine washable.",
                    ["roadster-tee-1", "roadster-tee-2"]),
        ProductSeed("Allen Solly Men's Polo Neck T-Shirt", "Allen Solly",
                    Decimal("599"), Decimal("1499"), Decimal("4.3"), 18723, 180, True,
                    "Cotton-blend pique, slim fit, two-button placket, branded patch.",
                    ["allensolly-polo-1", "allensolly-polo-2"]),
        ProductSeed("Levi's 511 Slim Fit Men's Jeans", "Levi's",
                    Decimal("1799"), Decimal("3499"), Decimal("4.4"), 9211, 95, True,
                    "Mid-rise, slim through thigh, tapered leg, stretch denim.",
                    ["levis511-1", "levis511-2"]),
        ProductSeed("Nike Revolution 6 NN Men's Running Shoes", "Nike",
                    Decimal("2495"), Decimal("3995"), Decimal("4.4"), 14782, 60, True,
                    "Soft foam midsole, breathable mesh upper, rubber outsole for traction.",
                    ["nike-rev6-1", "nike-rev6-2", "nike-rev6-3"]),
        ProductSeed("Puma Men's Casual Sneakers", "Puma",
                    Decimal("1799"), Decimal("4499"), Decimal("4.2"), 8912, 70, False,
                    "Synthetic upper, padded collar, EVA cushioning, lace-up closure.",
                    ["puma-sneaker-1", "puma-sneaker-2"]),
        ProductSeed("Fastrack Analog Black Dial Men's Watch", "Fastrack",
                    Decimal("1295"), Decimal("2495"), Decimal("4.3"), 24501, 140, True,
                    "Stainless steel case, leather strap, water-resistant up to 30m.",
                    ["fastrack-watch-1", "fastrack-watch-2"]),
        ProductSeed("Ray-Ban Aviator Classic Gold Frame Sunglasses", "Ray-Ban",
                    Decimal("6290"), Decimal("7990"), Decimal("4.5"), 3421, 22, True,
                    "Iconic teardrop shape, crystal G-15 lenses, 100% UV protection.",
                    ["rayban-1", "rayban-2"]),
    ],
    "home": [
        ProductSeed("Solimo 12-Piece Opalware Dinner Set", "Solimo",
                    Decimal("999"), Decimal("2499"), Decimal("4.3"), 21344, 80, True,
                    "Microwave-safe opalware, lightweight yet chip-resistant, dishwasher safe.",
                    ["solimo-dinner-1", "solimo-dinner-2"]),
        ProductSeed("Milton Thermosteel Flip Lid Flask 1000ml", "Milton",
                    Decimal("949"), Decimal("1650"), Decimal("4.5"), 41021, 130, True,
                    "Double-walled stainless steel, 24h hot, 24h cold, leak-proof flip lid.",
                    ["milton-flask-1", "milton-flask-2"]),
        ProductSeed("Bombay Dyeing Cotton Double Bedsheet", "Bombay Dyeing",
                    Decimal("699"), Decimal("1899"), Decimal("4.1"), 9842, 120, False,
                    "100% cotton, 144 TC, two pillow covers included, machine washable.",
                    ["bombay-bedsheet-1", "bombay-bedsheet-2"]),
        ProductSeed("Prestige Omega Deluxe Non-Stick Tawa 250mm", "Prestige",
                    Decimal("599"), Decimal("1295"), Decimal("4.4"), 18211, 90, True,
                    "Heavy-gauge aluminium, non-stick coating, induction & gas compatible.",
                    ["prestige-tawa-1", "prestige-tawa-2"]),
        ProductSeed("Pigeon Stainless Steel Pressure Cooker 3L", "Pigeon",
                    Decimal("949"), Decimal("1995"), Decimal("4.3"), 11203, 75, True,
                    "Outer lid, ISI certified, gas and induction base, 5-year warranty.",
                    ["pigeon-cooker-1", "pigeon-cooker-2"]),
        ProductSeed("Wakefit Orthopaedic Memory Foam Pillow", "Wakefit",
                    Decimal("699"), Decimal("1799"), Decimal("4.2"), 32401, 200, True,
                    "Cervical support, removable cotton cover, hypoallergenic memory foam.",
                    ["wakefit-pillow-1", "wakefit-pillow-2"]),
    ],
    "appliances": [
        ProductSeed("LG 1.5 Ton 5 Star DUAL Inverter Split AC (2024)", "LG",
                    Decimal("38990"), Decimal("64990"), Decimal("4.4"), 8421, 14, True,
                    "Copper condenser, DUAL Inverter Compressor, HD filter, 4-in-1 cooling.",
                    ["lg-ac-1", "lg-ac-2", "lg-ac-3"]),
        ProductSeed("Samsung 7 kg Fully Automatic Front Load Washing Machine", "Samsung",
                    Decimal("16990"), Decimal("24500"), Decimal("4.3"), 5712, 9, True,
                    "Digital Inverter motor, Hygiene Steam, 5-Star, Diamond Drum.",
                    ["samsung-wm-1", "samsung-wm-2"]),
        ProductSeed("Bajaj Majesty 750W Mixer Grinder with 3 Jars", "Bajaj",
                    Decimal("2599"), Decimal("4999"), Decimal("4.2"), 31201, 100, False,
                    "750W motor, 3-speed control with pulse, 3 stainless steel jars, 2-year warranty.",
                    ["bajaj-mixer-1", "bajaj-mixer-2"]),
        ProductSeed("Philips Daily Collection Air Fryer HD9200", "Philips",
                    Decimal("8995"), Decimal("12995"), Decimal("4.5"), 14821, 28, True,
                    "Rapid Air technology, up to 90% less fat, 4.1L basket, NutriU app recipes.",
                    ["philips-af-1", "philips-af-2"]),
        ProductSeed("IFB 23L Convection Microwave Oven", "IFB",
                    Decimal("13490"), Decimal("18990"), Decimal("4.3"), 4912, 11, True,
                    "10 auto-cook menus, convection + grill, child lock, 2-year comprehensive warranty.",
                    ["ifb-mw-1", "ifb-mw-2"]),
        ProductSeed("Eureka Forbes Aquaguard Aura RO+UV+UF Water Purifier", "Eureka Forbes",
                    Decimal("8999"), Decimal("15499"), Decimal("4.0"), 6234, 17, True,
                    "7L tank, taste adjuster, active copper technology, 7-stage purification.",
                    ["aquaguard-1", "aquaguard-2"]),
    ],
}


def _unsplash(photo_id: str, size: int = 600) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?w={size}&h={size}&fit=crop&auto=format&q=80"


def _placeholder(product_name: str, idx: int = 0, size: int = 600) -> str:
    short = product_name.split("(")[0].strip()
    if len(short) > 38:
        short = short[:38].rstrip() + "…"
    label = short.replace(" ", "+").replace(",", "")
    return f"https://placehold.co/{size}x{size}/ffffff/212121?text={label}&font=raleway"


PRODUCT_IMAGES: dict[str, list[str]] = {
    "Samsung Galaxy M14 5G (Smoky Teal, 128 GB)": [
        "1592750475338-74b7b21085ab", "1574944985070-8f3ebc6b79d2", "1567581935884-3349723552ca",
    ],
    "Redmi 13C (Stardust Black, 4GB RAM, 128 GB Storage)": [
        "1567581935884-3349723552ca", "1592750475338-74b7b21085ab", "1574944985070-8f3ebc6b79d2",
    ],
    "Realme Narzo 60 5G (Cosmic Black, 8 GB RAM, 128 GB)": [
        "1574944985070-8f3ebc6b79d2", "1567581935884-3349723552ca", "1592750475338-74b7b21085ab",
    ],
    "Apple iPhone 13 (Midnight, 128 GB)": [
        "1511707171634-5f897ff02aa9", "1592899677977-9c10ca588bbd", "1511707171634-5f897ff02aa9",
    ],
    "OnePlus Nord CE 4 (Celadon Marble, 8 GB RAM, 128 GB Storage)": [
        "1592750475338-74b7b21085ab", "1567581935884-3349723552ca", "1574944985070-8f3ebc6b79d2",
    ],
    "Vivo Y28 5G (Crystal Purple, 6 GB RAM, 128 GB)": [
        "1567581935884-3349723552ca", "1574944985070-8f3ebc6b79d2", "1592750475338-74b7b21085ab",
    ],
    "Motorola Moto G54 5G (Pearl Blue, 8 GB RAM, 128 GB)": [
        "1574944985070-8f3ebc6b79d2", "1592750475338-74b7b21085ab", "1567581935884-3349723552ca",
    ],
    "Poco X6 Pro 5G (Black, 8 GB RAM, 256 GB Storage)": [
        "1592750475338-74b7b21085ab", "1574944985070-8f3ebc6b79d2", "1567581935884-3349723552ca",
    ],
    "boAt Rockerz 450 Bluetooth On-Ear Headphones": [
        "1505740420928-5e560c06d30e", "1583394838336-acd977736f90", "1505740420928-5e560c06d30e",
    ],
    "JBL Tune 510BT Wireless On-Ear Headphones": [
        "1583394838336-acd977736f90", "1505740420928-5e560c06d30e", "1546435770-a3e426bf472b",
    ],
    "Sony WH-1000XM4 Wireless Noise Cancelling Headphones": [
        "1505740420928-5e560c06d30e", "1583394838336-acd977736f90", "1505740420928-5e560c06d30e",
    ],
    "Logitech MX Master 3S Wireless Mouse": [
        "1527864550417-7fd91fc51a46", "1527864550417-7fd91fc51a46", "1527864550417-7fd91fc51a46",
    ],
    "HP Pavilion 15 Intel Core i5 12th Gen Laptop": [
        "1496181133206-80ce9b88a853", "1527443224154-c4a3942d3acf", "1496181133206-80ce9b88a853",
    ],
    "Apple Watch SE (2nd Gen) GPS 40mm": [
        "1579586337278-3befd40fd17a", "1579586337278-3befd40fd17a", "1546868871-7041f2a55e12",
    ],
    "Noise ColorFit Pro 4 Smartwatch": [
        "1546868871-7041f2a55e12", "1579586337278-3befd40fd17a", "1546868871-7041f2a55e12",
    ],
    "Roadster Men's Pure Cotton Round Neck T-Shirt": [
        "1521572163474-6864f9cf17ab", "1521572163474-6864f9cf17ab", "1521572163474-6864f9cf17ab",
    ],
    "Allen Solly Men's Polo Neck T-Shirt": [
        "1618354691373-d851c5c3a990", "1618354691373-d851c5c3a990", "1618354691373-d851c5c3a990",
    ],
    "Levi's 511 Slim Fit Men's Jeans": [
        "1542272604-787c3835535d", "1542272604-787c3835535d", "1542272604-787c3835535d",
    ],
    "Nike Revolution 6 NN Men's Running Shoes": [
        "1542291026-7eec264c27ff", "1595950653106-6c9ebd614d3a", "1542291026-7eec264c27ff",
    ],
    "Puma Men's Casual Sneakers": [
        "1595950653106-6c9ebd614d3a", "1542291026-7eec264c27ff", "1595950653106-6c9ebd614d3a",
    ],
    "Fastrack Analog Black Dial Men's Watch": [
        "1523275335684-37898b6baf30", "1523275335684-37898b6baf30", "1523275335684-37898b6baf30",
    ],
    "Ray-Ban Aviator Classic Gold Frame Sunglasses": [
        "1572635196237-14b3f281503f", "1572635196237-14b3f281503f", "1572635196237-14b3f281503f",
    ],
    "Solimo 12-Piece Opalware Dinner Set": [
        "1583847268964-b28dc8f51f92", "1592861956120-e524fc739696", "1583847268964-b28dc8f51f92",
    ],
    "Milton Thermosteel Flip Lid Flask 1000ml": [
        "1602143407151-7111542de6e8", "1602143407151-7111542de6e8", "1602143407151-7111542de6e8",
    ],
    "Bombay Dyeing Cotton Double Bedsheet": [
        "1505693416388-ac5ce068fe85", "1505693416388-ac5ce068fe85", "1505693416388-ac5ce068fe85",
    ],
    "Prestige Omega Deluxe Non-Stick Tawa 250mm": [
        "1556909114-f6e7ad7d3136", "1556909114-f6e7ad7d3136", "1556909114-f6e7ad7d3136",
    ],
    "Pigeon Stainless Steel Pressure Cooker 3L": [
        "1585032226651-759b368d7246", "1585032226651-759b368d7246", "1585032226651-759b368d7246",
    ],
    "Wakefit Orthopaedic Memory Foam Pillow": [
        "1631679706909-1844bbd07221", "1631679706909-1844bbd07221", "1631679706909-1844bbd07221",
    ],
    "LG 1.5 Ton 5 Star DUAL Inverter Split AC (2024)": [
        "1606117331085-5760e3b58520", "1606117331085-5760e3b58520", "1606117331085-5760e3b58520",
    ],
    "Samsung 7 kg Fully Automatic Front Load Washing Machine": [
        "1626806787461-102c1bfaaea1", "1626806787461-102c1bfaaea1", "1626806787461-102c1bfaaea1",
    ],
    "Bajaj Majesty 750W Mixer Grinder with 3 Jars": [
        "1585515320310-259814833e62", "1585515320310-259814833e62", "1585515320310-259814833e62",
    ],
    "Philips Daily Collection Air Fryer HD9200": [
        "1626082927389-6cd097cdc6ec", "1574180566232-aaad1b5b8450", "1626082927389-6cd097cdc6ec",
    ],
    "IFB 23L Convection Microwave Oven": [
        "1574269909862-7e1d70bb8078", "1574269909862-7e1d70bb8078", "1574269909862-7e1d70bb8078",
    ],
    "Eureka Forbes Aquaguard Aura RO+UV+UF Water Purifier": [
        "1559839734-2b71ea197ec2", "1606107557195-0e29a4b5b4aa", "1559839734-2b71ea197ec2",
    ],
}


def _discount(price: Decimal, mrp: Decimal) -> int:
    if mrp <= 0:
        return 0
    return int(round(float((mrp - price) / mrp) * 100))


def upsert_category(db, name: str, slug: str, icon_url: str) -> Category:
    existing = db.scalar(select(Category).where(Category.slug == slug))
    if existing:
        existing.name = name
        existing.icon_url = icon_url
        return existing
    cat = Category(name=name, slug=slug, icon_url=icon_url)
    db.add(cat)
    db.flush()
    return cat


def upsert_product(db, seed: ProductSeed, category_id: int) -> Product:
    existing = db.scalar(
        select(Product).where(Product.name == seed.name, Product.brand == seed.brand)
    )
    discount = _discount(seed.price, seed.mrp)
    image_urls = _image_urls_for(seed.name)

    if existing:
        existing.price = seed.price
        existing.mrp = seed.mrp
        existing.discount_percent = discount
        existing.rating = seed.rating
        existing.rating_count = seed.rating_count
        existing.stock = seed.stock
        existing.assured = seed.assured
        existing.description = seed.description
        existing.category_id = category_id
        existing.images.clear()
        db.flush()
        for pos, url in enumerate(image_urls):
            existing.images.append(ProductImage(url=url, position=pos))
        return existing

    product = Product(
        name=seed.name,
        brand=seed.brand,
        description=seed.description,
        category_id=category_id,
        price=seed.price,
        mrp=seed.mrp,
        discount_percent=discount,
        rating=seed.rating,
        rating_count=seed.rating_count,
        stock=seed.stock,
        assured=seed.assured,
    )
    db.add(product)
    db.flush()
    for pos, url in enumerate(image_urls):
        product.images.append(ProductImage(url=url, position=pos))
    return product


def _image_urls_for(name: str) -> list[str]:
    ids = PRODUCT_IMAGES.get(name)
    if ids:
        return [_unsplash(pid) for pid in ids]
    return [_placeholder(name, idx=0)]


def run() -> None:
    db = SessionLocal()
    try:
        slug_to_id: dict[str, int] = {}
        for name, slug, icon_url in CATEGORIES:
            cat = upsert_category(db, name, slug, icon_url)
            slug_to_id[slug] = cat.id

        total = 0
        for slug, products in PRODUCTS_BY_CATEGORY.items():
            cat_id = slug_to_id[slug]
            for seed in products:
                upsert_product(db, seed, cat_id)
                total += 1

        db.commit()
        print(f"Seed complete: {len(CATEGORIES)} categories, {total} products.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
