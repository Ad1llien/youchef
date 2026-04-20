import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import hybridMeals from "../mealsDB.json";
import searchIcon from "../icons/search-2-line.svg";
import Pagination from "./Pagination.jsx";

const MEALS_PER_PAGE = 15;
const CATEGORIES = [
  { label: "All", value: "all" },
  { label: "Breakfast", value: "Breakfast" },
  { label: "Lunch", value: "Seafood" },
  { label: "Dinner", value: "Beef" },
  { label: "Vegetarian", value: "Vegetarian" },
  { label: "Dessert", value: "Dessert" },
  { label: "Pasta", value: "Pasta" },
];

// Overpass fallback servers
const OVERPASS_SERVERS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];


// ─── Прайс-лист KZT (Алматы) — все ингредиенты ──────────────────────────────
const PRICES_KZT = {
  "chicken": 350, "salmon": 1200, "beef": 700, "pork": 600, "avocado": 400,
  "apple cider vinegar": 300, "asparagus": 500, "aubergine": 200, "baby plum tomatoes": 350,
  "bacon": 700, "baking powder": 150, "balsamic vinegar": 500, "basil": 250,
  "basil leaves": 250, "basmati rice": 200, "bay leaf": 100, "bay leaves": 100,
  "beef brisket": 800, "beef fillet": 1200, "beef gravy": 100, "beef stock": 60,
  "bicarbonate of soda": 100, "biryani masala": 400, "black pepper": 300,
  "black treacle": 400, "borlotti beans": 200, "bowtie pasta": 160,
  "bramley apples": 200, "brandy": 1500, "bread": 150, "breadcrumbs": 120,
  "broccoli": 200, "brown lentils": 160, "brown rice": 200, "brown sugar": 150,
  "butter": 600, "cacao": 500, "cajun": 350, "canned tomatoes": 150,
  "cannellini beans": 200, "cardamom": 600, "carrots": 80, "cashew nuts": 900,
  "cashews": 900, "caster sugar": 120, "cayenne pepper": 350, "celeriac": 200,
  "celery": 150, "celery salt": 200, "challots": 150, "charlotte potatoes": 150,
  "cheddar cheese": 800, "cheese": 700, "cheese curds": 500, "cherry tomatoes": 350,
  "chestnut mushroom": 350, "chicken breast": 500, "chicken breasts": 500,
  "chicken legs": 380, "chicken stock": 60, "chicken thighs": 400, "chickpeas": 200,
  "chili powder": 300, "chilled butter": 600, "chilli": 100, "chilli powder": 300,
  "chinese broccoli": 250, "chocolate chips": 600, "chopped onion": 60,
  "chopped parsley": 150, "chopped tomatoes": 150, "chorizo": 900,
  "christmas pudding": 600, "cilantro": 150, "cinnamon": 400, "cinnamon stick": 400,
  "cloves": 400, "coco sugar": 400, "cocoa": 400, "coconut cream": 400,
  "coconut milk": 350, "colby jack cheese": 900, "cold water": 0,
  "condensed milk": 300, "coriander": 200, "coriander leaves": 200,
  "coriander seeds": 300, "corn tortillas": 200, "cornstarch": 100, "cream": 400,
  "creme fraiche": 350, "cubed feta cheese": 700, "cucumber": 120, "cumin": 300,
  "cumin seeds": 350, "curry powder": 350, "dark brown sugar": 160,
  "dark soft brown sugar": 160, "dark soy sauce": 220, "demerara sugar": 150,
  "diced tomatoes": 150, "digestive biscuits": 300, "dill": 150, "doner meat": 700,
  "double cream": 450, "dried oregano": 300, "dry white wine": 900,
  "egg plants": 200, "egg rolls": 200, "egg white": 40, "egg yolks": 40,
  "eggs": 60, "enchilada sauce": 400, "english mustard": 300,
  "extra virgin olive oil": 1000, "fajita seasoning": 350, "farfalle": 160,
  "fennel bulb": 300, "fennel seeds": 350, "fenugreek": 300, "feta": 700,
  "fish sauce": 250, "flaked almonds": 750, "flax eggs": 300, "flour": 80,
  "flour tortilla": 200, "floury potatoes": 90, "free-range egg, beaten": 60,
  "free-range eggs, beaten": 60, "french lentils": 200, "fresh basil": 300,
  "fresh thyme": 300, "freshly chopped parsley": 150, "fries": 200,
  "full fat yogurt": 220, "garam masala": 400, "garlic": 200, "garlic clove": 200,
  "garlic powder": 300, "garlic sauce": 200, "ghee": 800, "ginger": 250,
  "ginger cordial": 300, "ginger garlic paste": 250, "ginger paste": 200,
  "golden syrup": 400, "gouda cheese": 800, "granulated sugar": 100,
  "grape tomatoes": 350, "greek yogurt": 250, "green beans": 200,
  "green chilli": 100, "green olives": 400, "green red lentils": 160,
  "green salsa": 300, "ground almonds": 700, "ground cumin": 300,
  "ground ginger": 300, "gruyère": 1400, "hard taco shells": 300,
  "harissa spice": 400, "heavy cream": 400, "honey": 500, "horseradish": 400,
  "hot beef stock": 60, "hotsauce": 300, "ice cream": 400,
  "italian fennel sausages": 700, "italian seasoning": 300, "jalapeno": 200,
  "jasmine rice": 200, "jerusalem artichokes": 300, "kale": 300,
  "khus khus": 500, "king prawns": 1200, "kosher salt": 100, "lamb": 900,
  "lamb loin chops": 1000, "lamb mince": 950, "lasagne sheets": 200,
  "lean minced beef": 750, "leek": 150, "lemon": 100, "lemon juice": 150,
  "lemon zest": 100, "lemons": 100, "lettuce": 200, "lime": 100,
  "little gem lettuce": 250, "macaroni": 130, "mackerel": 600,
  "madras paste": 300, "marjoram": 300, "massaman curry paste": 350,
  "medjool dates": 600, "meringue nests": 400, "milk": 100, "minced garlic": 220,
  "miniature marshmallows": 300, "mint": 150, "monterey jack cheese": 900,
  "mozzarella balls": 650, "muscovado sugar": 200, "mushrooms": 300,
  "mustard": 200, "mustard powder": 250, "mustard seeds": 300, "nutmeg": 500,
  "oil": 300, "olive oil": 800, "onion salt": 200, "onions": 60, "orange": 150,
  "orange zest": 150, "oregano": 300, "oyster sauce": 300, "paprika": 300,
  "parma ham": 1200, "parmesan": 1500, "parmesan cheese": 1500,
  "parmigiano-reggiano": 1600, "parsley": 150, "peanut butter": 500,
  "peanut oil": 500, "peanuts": 400, "peas": 150, "pecorino": 1200,
  "penne rigate": 150, "pepper": 300, "pine nuts": 1500,
  "pitted black olives": 400, "plain chocolate": 600, "plain flour": 80,
  "plum tomatoes": 200, "potato starch": 150, "potatoes": 80, "prawns": 1000,
  "puff pastry": 400, "raspberry jam": 400, "raw king prawns": 1200,
  "red chilli flakes": 300, "red chilli": 100, "red chilli powder": 300,
  "red onions": 80, "red pepper": 250, "red pepper flakes": 300, "red wine": 1000,
  "refried beans": 200, "rice": 150, "rice noodles": 200,
  "rice stick noodles": 200, "rice vermicelli": 200, "rigatoni": 160,
  "rocket": 300, "rolled oats": 150, "saffron": 3000, "sage": 300, "sake": 600,
  "salsa": 300, "salt": 50, "salted butter": 600, "sausages": 500,
  "sea salt": 100, "self-raising flour": 100, "semi-skimmed milk": 100,
  "sesame seed": 400, "shallots": 150, "shredded mexican cheese": 800,
  "shredded monterey jack cheese": 900, "small potatoes": 100,
  "smoked paprika": 350, "smoky paprika": 350, "sour cream": 200,
  "soy sauce": 200, "soya milk": 250, "spaghetti": 150, "spinach": 250,
  "spring onions": 100, "squash": 150, "stir-fry vegetables": 300,
  "strawberries": 400, "sugar": 100, "sultanas": 400, "sunflower oil": 300,
  "tamarind ball": 300, "tamarind paste": 300, "thai fish sauce": 250,
  "thai green curry paste": 350, "thai red curry paste": 350, "thyme": 300,
  "tomato ketchup": 200, "tomato puree": 150, "tomatoes": 180, "toor dal": 200,
  "tuna": 800, "turmeric": 300, "turmeric powder": 300, "turnips": 80,
  "vanilla": 500, "vanilla extract": 500, "veal": 900, "vegan butter": 400,
  "vegetable oil": 300, "vegetable stock": 50, "vegetable stock cube": 30,
  "vinaigrette dressing": 300, "vine leaves": 200, "vinegar": 100, "water": 0,
  "white chocolate chips": 700, "white fish": 700, "white fish fillets": 750,
  "white vinegar": 100, "white wine": 900, "whole milk": 100, "whole wheat": 150,
  "wholegrain bread": 200, "worcestershire sauce": 400, "yogurt": 200,
  "zucchini": 180, "pretzels": 300, "cream cheese": 450, "icing sugar": 130,
  "toffee popcorn": 300, "caramel": 400, "caramel sauce": 400,
  "tagliatelle": 170, "fettuccine": 170, "clotted cream": 500,
  "corn flour": 100, "mussels": 500, "fideo": 150, "monkfish": 1000,
  "vermicelli pasta": 150, "baby squid": 600, "squid": 600, "fish stock": 60,
  "pilchards": 400, "black olives": 400, "onion": 60, "tomato": 180,
  "duck": 800, "duck legs": 850, "chicken stock cube": 30,
  "pappardelle pasta": 200, "paccheri pasta": 200, "linguine pasta": 170,
  "sugar snap peas": 300, "crusty bread": 200, "fromage frais": 400,
  "clams": 700, "passata": 200, "rapeseed oil": 400, "stilton cheese": 1400,
  "lamb leg": 1000, "lamb shoulder": 950, "apricot": 300,
  "butternut squash": 180, "couscous": 300, "minced beef": 700,
  "turkey mince": 550, "barbeque sauce": 300, "sweetcorn": 150,
  "goose fat": 600, "duck fat": 600, "fennel": 300, "red wine vinegar": 350,
  "haricot beans": 180, "rosemary": 300, "butter beans": 200,
  "pinto beans": 180, "tomato sauce": 150, "mascarpone": 800,
  "mozzarella": 600, "ricotta": 700, "dried apricots": 500, "capers": 500,
  "banana": 100, "raspberries": 600, "blueberries": 700, "walnuts": 700,
  "pecan nuts": 1000, "maple syrup": 800, "light brown soft sugar": 150,
  "dark brown soft sugar": 160, "dark chocolate chips": 700,
  "milk chocolate": 600, "dark chocolate": 700, "pumpkin": 100,
  "shortcrust pastry": 400, "peanut cookies": 300, "gelatine leafs": 400,
  "peanut brittle": 400, "peaches": 300, "yellow pepper": 250,
  "green pepper": 200, "courgettes": 180, "tinned tomatos": 150,
  "chestnuts": 500, "wild mushrooms": 600, "truffle oil": 2000, "paneer": 600,
  "naan bread": 200, "lentils": 150, "roasted vegetables": 300,
  "kidney beans": 180, "mixed grain": 200, "tahini": 600, "tortillas": 200,
  "udon noodles": 250, "cabbage": 80, "shiitake mushrooms": 600,
  "mirin": 500, "sesame seed oil": 600, "baguette": 200, "vine tomatoes": 250,
  "suet": 400, "swede": 100, "ham": 650, "oysters": 1500, "stout": 400,
  "lard": 300, "lamb kidney": 400, "beef kidney": 300, "haddock": 700,
  "smoked haddock": 900, "brussels sprouts": 250, "raisins": 300,
  "currants": 300, "custard": 300, "mixed peel": 300, "redcurrants": 500,
  "blackberries": 600, "hazlenuts": 800, "braeburn apples": 200,
  "red food colouring": 200, "pink food colouring": 200,
  "blue food colouring": 200, "yellow food colouring": 200,
  "apricot jam": 300, "marzipan": 600, "almonds": 700, "black pudding": 500,
  "baked beans": 150, "white flour": 80, "yeast": 100, "fruit mix": 400,
  "dried fruit": 400, "cherry": 500, "glace cherry": 400, "treacle": 400,
  "oatmeal": 150, "oats": 150, "egg": 60, "beef shin": 600,
  "bouquet garni": 200, "single cream": 380, "red wine jelly": 400,
  "apples": 150, "goats cheese": 1100, "prosciutto": 1300,
  "unsalted butter": 620, "brie": 1200, "tarragon leaves": 350,
  "chives": 200, "pears": 200, "white chocolate": 700, "star anise": 500,
  "tiger prawns": 1200, "custard powder": 300, "desiccated coconut": 350,
  "frozen peas": 150, "minced pork": 600, "creamed corn": 200,
  "sun-dried tomatoes": 600, "dijon mustard": 350, "tabasco sauce": 500,
  "canola oil": 350, "cod": 800, "salt cod": 900, "ackee": 800, "jerk": 400,
  "ground beef": 700, "baby aubergine": 250, "paella rice": 250,
  "scotch bonnet": 200, "oxtail": 700, "broad beans": 200,
  "red snapper": 900, "malt vinegar": 200, "rice vinegar": 250,
  "water chestnut": 250, "tofu": 400, "doubanjiang": 400,
  "fermented black beans": 300, "scallions": 100, "sichuan pepper": 500,
  "wonton skin": 200, "starch": 100, "rice wine": 400, "cooking wine": 300,
  "duck sauce": 300, "gochujang": 400, "bean sprouts": 200, "noodles": 180,
  "wood ear mushrooms": 400, "dark rum": 1200, "light rum": 1000, "rum": 1000,
  "english muffins": 300, "muffins": 300, "white wine vinegar": 300,
  "smoked salmon": 1500, "mars bar": 400, "rice krispies": 300,
  "ancho chillies": 400, "almond milk": 300, "allspice": 350,
  "almond extract": 500, "tripe": 400, "goat meat": 800, "black beans": 200,
  "anchovy fillet": 600, "ras el hanout": 500, "filo pastry": 400,
  "orange blossom water": 400, "candied peel": 400, "grand marnier": 2000,
  "sherry": 900, "rose water": 300, "mixed spice": 350, "mincemeat": 400,
  "sweet potatoes": 200, "bread rolls": 200, "bun": 150, "potatoe buns": 200,
  "ground pork": 600, "pork chops": 650, "yukon gold potatoes": 120,
  "yellow onion": 65, "beef stock concentrate": 60,
  "chicken stock concentrate": 50, "persian cucumber": 150,
  "mayonnaise": 250, "sriracha": 400, "rhubarb": 200, "pita bread": 180,
  "bulgur wheat": 200, "quinoa": 500, "dill pickles": 300,
  "sesame seed burger buns": 200, "buns": 150, "iceberg lettuce": 200,
  "gherkin relish": 300, "cheese slices": 600, "shortening": 300,
  "warm water": 0, "boiling water": 0, "pickle juice": 100,
  "powdered sugar": 130, "kielbasa": 550, "polish sausage": 550,
  "sauerkraut": 200, "caraway seed": 350, "herring": 400, "jam": 300,
  "mulukhiyah": 300, "sushi rice": 250, "figs": 500, "cider": 400,
  "beetroot": 80, "sardines": 400, "ciabatta": 300, "buckwheat": 200,
  "prunes": 400, "grape leaves": 300, "falafel": 300,
  "green cardamom pods": 700, "black cardamom pods": 700,
  "corned beef": 600, "nutella": 700, "feather blade beef": 800,
  "mature cheddar": 900, "beef stock cubes": 30, "lean minced steak": 750,
  "cooked beetroot": 120, "soured cream and chive dip": 300,
  "unwaxed lemon": 120, "cocoa powder": 400, "can of chickpeas": 200,
  "barramundi": 900, "golden caster sugar": 120, "baby new potatoes": 150,
  "hot chilli powder": 300, "chilli flakes": 300, "streaky bacon": 750,
  "clear honey": 500, "jersey royal potatoes": 200, "natural yoghurt": 200,
  "appleton rum": 1200, "chinese five spice powder": 400,
  "sweet chilli sauce": 300, "ground cinnamon": 400, "chopped chive": 200,
  "ready rolled shortcrust pastry": 400, "chicken drumsticks": 360,
  "porridge oats": 150, "sirloin steak tips": 1200, "white cornmeal": 150,
  "cider vinegar": 300, "strong white flour": 110, "fast action yeast": 100,
  "rye bread": 250, "västerbottensost cheese": 1200, "white asparagus": 600,
  "full fat sour cream": 220, "instant yeast": 100, "vanilla sugar": 300,
  "vanilla pod": 600, "shredded coconut": 350, "buttermilk": 200,
  "melted butter": 600, "all purpose flour": 80, "fish fillet": 800,
  "shrimp": 900, "white cabbage": 80, "whole black peppercorns": 350,
  "red potatoes": 90, "bouillon cubes": 50, "pork knuckle": 500,
  "whipping cream": 420, "almond flour": 600, "mixed beef cuts": 650,
  "morcilla": 600, "beef cutlet": 800, "chimichurri sauce": 400,
  "dulce de leche": 500, "chickpea flour": 200, "beef flank steak": 900,
  "sweet smoked paprika": 350, "manchego": 1400, "wild garlic leaves": 300,
  "jamón ibérico": 2500, "strong white bread flour": 110,
  "dried white corn": 150, "dried white beans": 180, "seafood stock": 80,
  "padron peppers": 400, "raw tiger prawns": 1200, "dry sherry": 900,
  "hake": 800, "sherry vinegar": 400, "roasted pepper": 300,
  "pork belly slices": 700, "bacon lardon": 700, "mixed peppers": 250,
  "stale bread": 100, "dried cranberries": 500, "sweet sherry": 900,
  "frozen seafood mix": 800, "savoy cabbage": 120, "white bread": 150,
  "hot smoked paprika": 350, "garlic bulb": 150, "shelled hazelnuts": 800,
  "serrano ham": 1300, "beef tomatoes": 220, "semolina": 120,
  "ground poppy seeds": 400, "bryndza cheese": 700,
  "panang curry paste": 350, "makrut lime leaves": 200,
  "dried red chillies": 300, "shrimp paste": 300, "galangal": 300,
  "lemongrass": 200, "ground coriander": 300, "ground nutmeg": 500,
  "flat rice noodles": 200, "birds-eye chillies": 150,
  "sirloin steak": 1400, "lemongrass stalks": 200, "oyster mushrooms": 500,
  "lime juice": 150, "thai chilli jam": 350, "pork tenderloin": 750,
  "chilli sauce": 300, "ground nut oil": 500, "runner beans": 250,
  "trout": 800, "baby pak koi": 300, "vermicelli rice noodles": 200,
  "raw frozen prawns": 1000, "galangal paste": 300, "lime leaves": 200,
  "egg noodles": 200, "chinese leaf": 150, "five spice powder": 400,
  "brown rice noodle": 200, "pak choi": 250, "bamboo shoot": 300,
  "knafeh": 500, "arabic rice": 200, "hail": 300, "mixture powder": 350,
  "chuck roast": 700, "ground clove": 400, "ground cardomom": 600,
  "kabse spice": 400, "garlic granules": 300, "toast": 150,
  "unsalted pistachio": 1200, "oreo cream biscuits": 400, "sevaiiya": 300,
  "malai": 400, "liquid cheese": 500, "rice paper sheets": 300,
  "rainbow trout": 900, "bok choi": 250, "fillet of steak": 1400,
  "chinese cabbage": 150, "soda water": 100,
  "purple sprouting broccoli": 300, "lamb shanks": 900, "lamb stock": 60,
  "radish": 100, "szechuan peppercorns": 500,
  "pork shoulder steaks": 600, "palm sugar": 300, "soya bean": 200,
  "marinated tofu": 450, "hoisin sauce": 350, "rice flour pancakes": 300,
  "white bread mix": 200, "roasted peanut": 400,
  "hot smoked flaked salmon": 1400, "red cabbage": 100, "sea bass": 1000,
  "sea bass fillets": 1050, "petit pois": 180, "chicken liver": 250,
  "turkey": 600, "raw vegetables": 200, "vegan white wine vinegar": 300,
  "hummus": 400, "tempeh": 500, "romano pepper": 250,
  "red pepper paste": 300, "pomegranate molasses": 500, "pul biber": 400,
  "sumac": 500, "dried mint": 200, "sweet peppadew peppers": 350,
  "chicken wings": 350, "pistachio": 1200, "smoky aïoli": 300,
  "tahini paste": 600, "seasoning": 200, "stoned dates": 500,
  "strong wholemeal flour": 150, "turkish delight": 500,
  "vanilla custard": 350, "vanilla bean paste": 600,
  "ground pistachios": 1200, "new potatoes": 120, "semolina flour": 120,
  "freekeh": 400, "emmentaler cheese": 1100, "phyllo dough": 400,
  "plum jam": 300, "pistachio paste": 1300, "unwaxed lime": 120,
  "polish kabanos": 550, "hispi (sweetheart) cabbage": 150,
  "baby lettuce leaves": 250, "pomegranate": 400, "almond essence": 500,
  "german sausages": 600, "juniper berries": 500, "allspice berries": 400,
  "peppercorns": 350, "white sauerkraut": 200, "pork shoulder": 580,
  "cabbage leaves": 80, "cooked chestnut": 500, "cranberry": 600,
  "pork back ribs": 650, "rye": 200, "poppy seeds": 400,
  "wholegrain mustard": 400, "kabanos sausages": 550,
  "frozen mixed berries": 500, "blackcurrant jam": 350, "egg wash": 60,
  "molasses": 400, "bread flour": 100, "unsweetened cocoa": 400,
  "coconut flakes": 400, "peach juice": 200, "cornmeal": 150,
  "hind shank": 800, "sweet red peppers": 250, "cassaba": 300,
  "yautia": 300, "white yam": 300, "papelon": 300, "skirty steak": 900,
  "white masarepa": 200, "casabe": 300, "turkey ham": 550,
  "ground oats": 150, "sugar syrup": 200, "pre-fried tequeños": 400,
  "avacado hass pulp": 500, "sazon": 300, "yellow masarepa": 200,
  "unflavoured gelatin": 300, "passion fruit pulp": 400,
  "corn arepa filled with mozarella cheese": 500,
  "fried ripe bananas": 200, "pico de gallo sauce": 300,
  "shredded meat": 600, "yellow split peas": 180,
  "dried white navy beans": 180, "vegetable shortening": 300,
  "saskatoon berries": 500, "pitted dates": 500,
  "graham cracker crumbs": 400, "cream of tartar": 300,
  "dried leaves of summer savoury": 300, "russet potato": 90,
  "all-purpose seasoning": 300, "grape nut cereal": 400, "beer": 300,
  "caramelized sugar sauce": 300, "dried cherries": 600,
  "ground annatto": 300, "shrimp stock": 80, "snapper fish": 900,
  "fish seasoning": 300, "penne pasta": 150, "jamaican curry powder": 400,
  "turkey neck": 400, "smoked turkey neck": 500, "ground allspice": 350,
  "tamarind pulp": 300, "callaloo": 300, "jumbo shrimp": 1200,
  "unsweetened coconut milk": 350, "fine yellow cornmeal": 150,
  "sweetened condensed milk": 300, "orange juice": 200,
  "high heat cooking oil": 350, "seasoned rice vinegar": 250,
  "napa cabbage": 150, "cilantro leaves": 150, "silken tofu": 400,
  "chinese sesame sauce": 400, "unsalted beef stock": 60,
  "shaoxing wine": 400, "mung bean sprouts": 200,
  "chinese long beans": 200, "dried chillies": 300,
  "chicken bouillon powder": 100, "egg roll wrappers": 200,
  "plum sauce": 300, "chilli bean paste": 400, "snow peas": 300,
  "pineapple chunks": 200, "pineapple juice": 200, "dried shrimp": 600,
  "buckwheat flour": 200, "split peas": 180, "ground sugar": 100,
  "speculaas spice mix": 400, "almond paste": 600, "dutch stroop": 400
};

// Курсы валют относительно KZT (обновляются через API)
const DEFAULT_RATES = { KZT: 1, RUB: 0.22, USD: 0.00218, EUR: 0.002 };
const CURRENCY_SYMBOLS = { KZT: "₸", RUB: "₽", USD: "$", EUR: "€" };
const COUNTRY_CURRENCY = {
  KZ: "KZT", RU: "RUB", US: "USD", GB: "EUR", DE: "EUR",
  FR: "EUR", IT: "EUR", ES: "EUR", UA: "USD", BY: "RUB",
};

function MealPlanner() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);

  // ─── Геолокация и валюта ──────────────────────────────────────────────────
  const [currency, setCurrency] = useState("KZT");
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    const detectLocation = async () => {
      try {
        // Попытка через IP геолокацию
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const countryCode = data.country_code || "KZ";
        const detectedCurrency = COUNTRY_CURRENCY[countryCode] || "USD";
        setCurrency(detectedCurrency);

        // Получаем актуальные курсы
        try {
          const ratesRes = await fetch("https://api.exchangerate-api.com/v4/latest/KZT");
          const ratesData = await ratesRes.json();
          if (ratesData.rates) {
            setRates({
              KZT: 1,
              RUB: ratesData.rates.RUB || DEFAULT_RATES.RUB,
              USD: ratesData.rates.USD || DEFAULT_RATES.USD,
              EUR: ratesData.rates.EUR || DEFAULT_RATES.EUR,
            });
          }
        } catch { /* используем дефолтные курсы */ }
      } catch {
        // Если IP геолокация не работает — Алматы по умолчанию
        setCurrency("KZT");
      } finally {
        setLocationLoading(false);
      }
    };
    detectLocation();
  }, []);

  const convertPrice = (kztPrice) => {
    const rate = rates[currency] || 1;
    const converted = kztPrice * rate;
    const symbol = CURRENCY_SYMBOLS[currency] || "₸";
    if (currency === "KZT") return `${Math.round(converted).toLocaleString("ru-KZ")} ${symbol}`;
    if (currency === "USD" || currency === "EUR") return `${symbol}${converted.toFixed(2)}`;
    return `${Math.round(converted).toLocaleString("ru-RU")} ${symbol}`;
  };
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("all");

  // Ticket modal
  const [showModal, setShowModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Search
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Drag scroll for filters
  const filtersRef = useRef(null);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);

  const onFilterMouseDown = (e) => {
    isDragging.current = true;
    dragStartX.current = e.pageX;
    scrollStartX.current = filtersRef.current.scrollLeft;
    filtersRef.current.style.cursor = "grabbing";
    filtersRef.current.style.userSelect = "none";
  };
  const onFilterMouseMove = (e) => {
    if (!isDragging.current) return;
    const diff = e.pageX - dragStartX.current;
    filtersRef.current.scrollLeft = scrollStartX.current - diff;
  };
  const onFilterMouseUp = () => {
    isDragging.current = false;
    if (filtersRef.current) {
      filtersRef.current.style.cursor = "grab";
      filtersRef.current.style.userSelect = "";
    }
  };

  // Touch drag for filters
  const touchStartX = useRef(0);
  const touchScrollX = useRef(0);
  const onFilterTouchStart = (e) => {
    touchStartX.current = e.touches[0].pageX;
    touchScrollX.current = filtersRef.current.scrollLeft;
  };
  const onFilterTouchMove = (e) => {
    const diff = e.touches[0].pageX - touchStartX.current;
    filtersRef.current.scrollLeft = touchScrollX.current - diff;
  };

  // Map
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [showStoresSection, setShowStoresSection] = useState(false);
  const [stores, setStores] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const storesSectionRef = useRef(null);
  const userLocRef = useRef(null);
  const leafletLoadedRef = useRef(false);

  useEffect(() => { loadMeals("all"); }, []);

  const loadMeals = (cat) => {
    setLoading(true);
    setCurrentPage(1);
    const url = cat === "all"
      ? "https://www.themealdb.com/api/json/v2/65232507/search.php?s="
      : `https://www.themealdb.com/api/json/v2/65232507/filter.php?c=${cat}`;
    fetch(url).then(r => r.json()).then(d => {
      const api = d.meals || [];
      const local = hybridMeals.meals || [];
      const map = new Map();
      api.forEach(m => map.set(m.idMeal, m));
      if (cat === "all") local.forEach(m => map.set(m.idMeal, m));
      setMeals(Array.from(map.values()));
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  // Search
  useEffect(() => {
    if (!query.trim()) { setSearchResults([]); setShowDropdown(false); return; }
    const t = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`https://www.themealdb.com/api/json/v2/65232507/search.php?s=${query}`);
        const data = await res.json();
        const api = data.meals || [];
        const local = (hybridMeals.meals || []).filter(m => m.strMeal.toLowerCase().includes(query.toLowerCase()));
        const map = new Map();
        api.forEach(m => map.set(m.idMeal, m));
        local.forEach(m => map.set(m.idMeal, m));
        setSearchResults(Array.from(map.values()).slice(0, 8));
        setShowDropdown(true);
      } catch (e) { console.error(e); }
      setSearchLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const h = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDropdown(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Mouse up globally
  useEffect(() => {
    document.addEventListener("mouseup", onFilterMouseUp);
    document.addEventListener("mousemove", onFilterMouseMove);
    return () => {
      document.removeEventListener("mouseup", onFilterMouseUp);
      document.removeEventListener("mousemove", onFilterMouseMove);
    };
  }, []);

  // ─── MAP ─────────────────────────────────────────────────────
  const destroyMap = () => {
    markersRef.current.forEach(m => { try { m.remove(); } catch (e) {} });
    markersRef.current = [];
    if (leafletMapRef.current) {
      try { leafletMapRef.current.remove(); } catch (e) {}
      leafletMapRef.current = null;
    }
  };

  const buildMap = useCallback((lat, lng) => {
    if (!mapRef.current) return null;
    destroyMap();
    const L = window.L;
    // Clear container
    mapRef.current.innerHTML = "";
    const map = L.map(mapRef.current, { zoomControl: false }).setView([lat, lng], 14);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap", maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    leafletMapRef.current = map;

    const userIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#242D96;border:3px solid white;box-shadow:0 2px 8px rgba(36,45,150,0.6)"></div>`,
      className: "", iconSize: [14, 14], iconAnchor: [7, 7],
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup("📍 You are here");
    return map;
  }, []);

  // Try multiple Overpass servers
  const fetchOverpass = async (query) => {
    for (const server of OVERPASS_SERVERS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);
        const res = await fetch(server, {
          method: "POST",
          body: query,
          signal: controller.signal,
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        clearTimeout(timeoutId);
        if (!res.ok) continue;
        const text = await res.text();
        // Check if response is JSON
        if (!text.trim().startsWith("{")) continue;
        return JSON.parse(text);
      } catch (e) {
        console.warn(`Overpass server ${server} failed:`, e.message);
        continue;
      }
    }
    throw new Error("All Overpass servers failed");
  };

  const fetchStores = useCallback(async (lat, lng, map) => {
    setStoresLoading(true);
    setStores([]);
    try {
      const q = `[out:json][timeout:20];(node["shop"~"supermarket|convenience|grocery"](around:3000,${lat},${lng}););out body 25;`;
      const data = await fetchOverpass(q);
      const L = window.L;

      markersRef.current.forEach(m => { try { m.remove(); } catch (e) {} });
      markersRef.current = [];

      const storeList = (data.elements || []).slice(0, 20).map((el, idx) => {
        const name = el.tags?.name || "Store";
        const type = el.tags?.shop || "store";
        const address = [el.tags?.["addr:street"], el.tags?.["addr:housenumber"]]
          .filter(Boolean).join(" ") || el.tags?.["addr:full"] || null;
        const hours = el.tags?.opening_hours || null;
        const phone = el.tags?.phone || el.tags?.["contact:phone"] || null;
        const website = el.tags?.website || el.tags?.["contact:website"] || null;

        const dist = Math.round(Math.sqrt(
          Math.pow((el.lat - lat) * 111000, 2) +
          Math.pow((el.lon - lng) * 111000 * Math.cos(lat * Math.PI / 180), 2)
        ));

        const storeIcon = L.divIcon({
          html: `<div style="width:34px;height:34px;border-radius:50%;background:#242D96;border:2.5px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 12px rgba(36,45,150,0.45);font-size:16px;cursor:pointer;">🛒</div>`,
          className: "", iconSize: [34, 34], iconAnchor: [17, 17],
        });

        const marker = L.marker([el.lat, el.lon], { icon: storeIcon }).addTo(map);
        marker.bindPopup(`<div style="font-family:Teachers,sans-serif"><b style="color:#242D96">${name}</b>${address ? `<br><small>📍 ${address}</small>` : ""}${hours ? `<br><small style="color:#029663">🕐 ${hours}</small>` : ""}</div>`);
        marker.on("click", () => setSelectedStore(idx));
        markersRef.current.push(marker);

        return { id: idx, name, type, lat: el.lat, lng: el.lon, dist, address, hours, phone, website };
      });

      storeList.sort((a, b) => a.dist - b.dist);
      setStores(storeList);
    } catch (err) {
      console.error("Stores fetch error:", err);
      setLocationError("Could not load stores. Please try Refresh.");
    } finally {
      setStoresLoading(false);
    }
  }, []);

  const initMapWithLocation = useCallback(() => {
    const doInit = (lat, lng) => {
      userLocRef.current = { lat, lng };
      setTimeout(() => {
        const map = buildMap(lat, lng);
        if (map) fetchStores(lat, lng, map);
      }, 150);
    };

    if (userLocRef.current) { doInit(userLocRef.current.lat, userLocRef.current.lng); return; }

    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported. Showing Almaty.");
      doInit(43.222, 76.851);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => doInit(pos.coords.latitude, pos.coords.longitude),
      () => { setLocationError("Location access denied. Showing Almaty center."); doInit(43.222, 76.851); },
      { timeout: 8000, maximumAge: 60000 }
    );
  }, [buildMap, fetchStores]);

  useEffect(() => {
    if (showStoresSection) {
      setTimeout(() => storesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      const doSetup = () => initMapWithLocation();
      if (!leafletLoadedRef.current) {
        if (window.L) { leafletLoadedRef.current = true; doSetup(); return; }
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => { leafletLoadedRef.current = true; doSetup(); };
        document.head.appendChild(script);
      } else {
        doSetup();
      }
    } else {
      destroyMap();
      setSelectedStore(null);
    }
  }, [showStoresSection]);

  const focusStore = (store) => {
    setSelectedStore(store.id);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([store.lat, store.lng], 16, { animate: true });
      markersRef.current[store.id]?.openPopup();
    }
  };

  // ─── CART ────────────────────────────────────────────────────
  const getIngredients = (meal) => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const mea = meal[`strMeasure${i}`];
      if (ing && ing.trim()) list.push({ ingredient: ing.trim(), measure: mea?.trim() || "" });
    }
    return list;
  };

  const toggleCart = async (meal) => {
    const inCart = cart.find(c => c.idMeal === meal.idMeal);
    if (inCart) { setCart(cart.filter(c => c.idMeal !== meal.idMeal)); return; }

    // If meal has no ingredients (filter.php returns minimal data), fetch full data
    let fullMeal = meal;
    const hasIngredients = meal.strIngredient1 && meal.strIngredient1.trim();
    if (!hasIngredients) {
      try {
        // First check local DB
        const local = (hybridMeals.meals || []).find(m => m.idMeal === meal.idMeal);
        if (local && local.strIngredient1) {
          fullMeal = local;
        } else {
          const res = await fetch(`https://www.themealdb.com/api/json/v2/65232507/lookup.php?i=${meal.idMeal}`);
          const data = await res.json();
          if (data.meals?.[0]) fullMeal = data.meals[0];
        }
      } catch (e) { console.error(e); }
    }

    setCart(prev => [...prev, { ...fullMeal, ingredients: getIngredients(fullMeal) }]);
  };

  const allIngredients = () => {
    const map = new Map();
    cart.forEach(meal => {
      (meal.ingredients || []).forEach(({ ingredient, measure }) => {
        const key = ingredient.toLowerCase();
        if (map.has(key)) { if (measure) map.get(key).measures.push(measure); }
        else map.set(key, { ingredient, measures: measure ? [measure] : [] });
      });
    });
    return Array.from(map.values());
  };

  const ingredientsList = allIngredients();

  // ─── Расчёт стоимости каждого ингредиента и общей суммы ──────────────────
  const getPriceForIngredient = (ingredient) => {
    const key = ingredient.toLowerCase().trim();
    if (PRICES_KZT[key]) return PRICES_KZT[key];
    // Частичное совпадение
    const found = Object.keys(PRICES_KZT).find(k => key.includes(k) || k.includes(key));
    return found ? PRICES_KZT[found] : null;
  };

  const ingredientsWithPrices = ingredientsList.map(item => ({
    ...item,
    priceKZT: getPriceForIngredient(item.ingredient),
  }));

  const totalKZT = ingredientsWithPrices.reduce((sum, i) => sum + (i.priceKZT || 0), 0);

  const ticketId = `YC-${Date.now().toString().slice(-8)}`;

  const openModal = () => { setShowModal(true); setTimeout(() => setModalVisible(true), 10); };
  const closeModal = () => { setModalVisible(false); setTimeout(() => setShowModal(false), 380); };

  const copyList = () => {
    const text = "🛒 YouChef Shopping List\n\n" +
      cart.map(m => `• ${m.strMeal}`).join("\n") +
      "\n\nIngredients:\n" +
      ingredientsList.map(i => `☐ ${i.ingredient}  ${i.measures.join(" + ")}`).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadList = () => {
    const { plan: _p, ..._ } = {};
    const mealNames = cart.map(m => m.strMeal);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Shopping List — YouChef</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Teachers:wght@400;500;600;700&family=Taviraj:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Teachers', sans-serif; background: #FDFBE7; display: flex; justify-content: center; padding: 40px 16px; }
  .ticket { width: 100%; max-width: 480px; background: white; border-radius: 20px; overflow: visible; box-shadow: 0 8px 40px rgba(36,45,150,0.15); }
  .ticket-top { background: #242D96; border-radius: 20px 20px 0 0; padding: 28px 28px 24px; position: relative; overflow: hidden; }
  .ticket-top::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; border-radius: 50%; background: rgba(255,255,255,0.06); }
  .brand { font-size: 10px; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 3px; margin-bottom: 6px; }
  .title { font-family: 'Taviraj', serif; font-size: 26px; font-weight: 500; color: white; margin-bottom: 16px; }
  .meal-chips { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip { background: rgba(255,255,255,0.12); border-radius: 30px; padding: 4px 12px; color: white; font-size: 12px; }
  .tear { position: relative; height: 28px; background: #FDFBE7; display: flex; align-items: center; }
  .tear::before { content: ''; position: absolute; left: -14px; width: 28px; height: 28px; border-radius: 50%; background: #FDFBE7; }
  .tear::after { content: ''; position: absolute; right: -14px; width: 28px; height: 28px; border-radius: 50%; background: #FDFBE7; }
  .tear-line { flex: 1; margin: 0 14px; border-top: 2.5px dashed #BBC8D8; }
  .ticket-body { padding: 20px 28px; }
  .stats { display: flex; justify-content: space-around; padding: 14px 0; border-bottom: 1px solid #f3f4f6; margin-bottom: 16px; }
  .stat { text-align: center; }
  .stat-num { font-size: 24px; font-weight: 700; color: #242D96; }
  .stat-label { font-size: 11px; color: #788CA5; margin-top: 2px; }
  .stat-divider { width: 1px; background: #f3f4f6; }
  .ingredient-row { display: flex; align-items: center; gap: 12px; padding: 9px 0; border-bottom: 1px solid #f9f9f9; justify-content: space-between; }
  .ing-img { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }
  .ing-name { font-weight: 500; color: #242D96; font-size: 14px; }
  .ing-measure { color: #788CA5; font-size: 12px; margin-top: 2px; }
  .tear2 { position: relative; height: 28px; display: flex; align-items: center; margin-top: 16px; }
  .tear2::before { content: ''; position: absolute; left: -14px; width: 28px; height: 28px; border-radius: 50%; background: #FDFBE7; }
  .tear2::after { content: ''; position: absolute; right: -14px; width: 28px; height: 28px; border-radius: 50%; background: #FDFBE7; }
  .tear2-line { flex: 1; margin: 0 14px; border-top: 2.5px dashed #e5e7eb; }
  .barcode-section { padding: 14px 0 4px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .ticket-id { color: #BBC8D8; font-size: 10px; letter-spacing: 4px; font-family: monospace; }
  .footer { background: #242D96; border-radius: 0 0 20px 20px; padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
  .footer-brand { color: rgba(255,255,255,0.6); font-size: 12px; }
  .footer-url { color: rgba(255,255,255,0.3); font-size: 11px; }
  @media print { body { background: white; padding: 20px; } }
</style>
</head>
<body>
<div class="ticket">
  <div class="ticket-top">
    <div class="brand">YouChef</div>
    <div class="title">Shopping List</div>
    <div class="meal-chips">
      ${mealNames.map(n => `<span class="chip">${n}</span>`).join("")}
    </div>
  </div>
  <div class="tear"><div class="tear-line"></div></div>
  <div class="ticket-body">
    <div class="stats">
      <div class="stat"><div class="stat-num">${cart.length}</div><div class="stat-label">Meals</div></div>
      <div class="stat-divider"></div>
      <div class="stat"><div class="stat-num">${ingredientsList.length}</div><div class="stat-label">Ingredients</div></div>
    </div>
    ${ingredientsWithPrices.map(({ ingredient, measures, priceKZT }) => {
        const price = priceKZT ? convertPrice(priceKZT) : null;
        return `
      <div class="ingredient-row">
        <img class="ing-img" src="https://www.themealdb.com/images/ingredients/${ingredient}-small.png" alt="${ingredient}" onerror="this.style.display='none'"/>
        <div style="flex:1">
          <div class="ing-name">${ingredient}</div>
          ${measures.filter(Boolean).length ? `<div class="ing-measure">${measures.filter(Boolean).join(" + ")}</div>` : ""}
        </div>
        ${price ? `<div style="font-size:12px;color:#788CA5;flex-shrink:0;padding-left:8px">~${price}</div>` : ""}
      </div>
    `}).join("")}
    ${totalKZT > 0 ? `
    <div style="margin-top:16px;background:#EEF0FB;border-radius:12px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
      <div>
        <div style="font-size:11px;color:#788CA5;font-family:Teachers,sans-serif">~Примерная стоимость</div>
        <div style="font-size:10px;color:#BBC8D8;margin-top:2px;font-family:Teachers,sans-serif">по ценам ${currency === "KZT" ? "Алматы" : currency === "RUB" ? "Москвы" : "региона"}</div>
      </div>
      <div style="font-size:20px;font-weight:700;color:#242D96;font-family:Teachers,sans-serif">${convertPrice(totalKZT)}</div>
    </div>` : ""}
    <div class="tear2"><div class="tear2-line"></div></div>
    <div class="barcode-section">
      <svg width="200" height="40" viewBox="0 0 200 40">
        ${Array.from({ length: 40 }, (_, i) => {
          const x = i * 5;
          const h = 26 + Math.sin(i * 1.9 + 0.5) * 9;
          const w = i % 4 === 0 ? 3 : i % 2 === 0 ? 2 : 1;
          return `<rect x="${x}" y="${40 - h}" width="${w}" height="${h}" fill="#242D96" opacity="${0.5 + (i % 4) * 0.12}"/>`;
        }).join("")}
      </svg>
      <div class="ticket-id">YC-${Date.now().toString().slice(-8)}</div>
    </div>
  </div>
  <div class="footer">
    <div class="footer-brand">Generated by YouChef</div>
    <div class="footer-url">youchef.kz</div>
  </div>
</div>
</body>
</html>`;
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };


  const totalPages = Math.ceil(meals.length / MEALS_PER_PAGE);
  const currentMeals = meals.slice((currentPage - 1) * MEALS_PER_PAGE, currentPage * MEALS_PER_PAGE);
  const fmt = (t) => !t ? "" : t.length > 8 ? t.slice(0, 8) + "..." : t;
  const typeEmoji = (t) => ({ supermarket: "🏪", convenience: "🏬", grocery: "🥬", mall: "🛍️" }[t] || "🛒");

  return (
    <div style={{ minHeight: "100vh", background: "#FDFBE7", fontFamily: "Teachers, sans-serif" }}>
      <div style={{ maxWidth: 1148, margin: "0 auto", padding: "40px 16px 80px" }}>

        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", cursor: "pointer", color: "#242D96", fontSize: 14, display: "flex", alignItems: "center", gap: 6, marginBottom: 28, fontFamily: "Teachers, sans-serif" }}>← Back</button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <h1 style={{ color: "#242D96", fontFamily: "Taviraj, serif", fontSize: "clamp(24px,5vw,36px)", fontWeight: 500, margin: "0 0 6px" }}>Meal Planner</h1>
            <p style={{ color: "#788CA5", fontSize: 14, margin: 0 }}>Pick meals and get a shopping list instantly</p>
          </div>
          {cart.length > 0 && (
            <button onClick={openModal} style={{ display: "flex", alignItems: "center", gap: 10, background: "#242D96", color: "white", border: "none", borderRadius: 50, padding: "10px 22px", cursor: "pointer", fontFamily: "Teachers, sans-serif", fontSize: 14, fontWeight: 500 }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{cart.length}</span>
              View Shopping List →
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mt-6 flex justify-center px-0 mb-6">
          <div ref={searchRef} className="relative w-full" style={{ maxWidth: 588 }}>
            <div className="relative">
              <input className="search-bar-input h-10 w-full box-border rounded-[30px] border border-[#ccc] bg-white pl-4 pr-11 text-[16px] text-[#242D96] outline-none sm:pl-5" placeholder="Search meal..." value={query} onChange={e => setQuery(e.target.value)} />
              <button type="button" className="absolute right-2 top-1/2 -translate-y-[45%] cursor-pointer border-none bg-transparent p-0">
                <img src={searchIcon} alt="Search" className="h-5 w-5 rounded-full bg-[#242D96] p-1" />
              </button>
            </div>
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute left-0 top-full z-[999] mt-2 max-h-[360px] w-full overflow-y-auto rounded-xl bg-[#FFFEEB] shadow-md">
                {searchResults.map(meal => {
                  const inCart = cart.some(c => c.idMeal === meal.idMeal);
                  return (
                    <div key={meal.idMeal} className="searchResultItem" style={{ justifyContent: "space-between" }}
                      onClick={() => { toggleCart(meal); setShowDropdown(false); setQuery(""); }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <img src={meal.strMealThumb} alt={meal.strMeal} className="h-12 w-12 rounded-[8px] object-cover" />
                        <span>{meal.strMeal}</span>
                      </div>
                      <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: inCart ? "#242D96" : "#f0f0f0", color: inCart ? "white" : "#788CA5", flexShrink: 0 }}>
                        {inCart ? "✓ Added" : "+ Add"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {searchLoading && <div className="mt-2 text-center text-sm text-[#242D96]">Searching...</div>}
          </div>
        </div>

        {/* Filters — draggable */}
        <div
          ref={filtersRef}
          onMouseDown={onFilterMouseDown}
          onTouchStart={onFilterTouchStart}
          onTouchMove={onFilterTouchMove}
          style={{
            display: "flex", gap: 10, overflowX: "auto", paddingBottom: 16,
            marginBottom: 24, scrollbarWidth: "none", cursor: "grab",
            WebkitOverflowScrolling: "touch", userSelect: "none",
          }}
        >
          {CATEGORIES.map(cat => {
            const isActive = activeFilter === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onMouseDown={e => e.stopPropagation()}
                onClick={() => { setActiveFilter(cat.value); loadMeals(cat.value); }}
                style={{
                  flexShrink: 0, padding: "7px 20px", borderRadius: 30, border: "1px solid",
                  borderColor: isActive ? "#C8D69B" : "#788CA5",
                  background: isActive ? "rgba(200,214,155,0.29)" : "transparent",
                  color: isActive ? "#343B1B" : "#788CA5",
                  cursor: "pointer", fontFamily: "Teachers, sans-serif", fontSize: 16,
                  transition: "all 0.2s", whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid — 3 cols, smaller cards */}
        {loading ? <div className="loader" style={{ margin: "60px auto" }} /> : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "16px 24px",
          }}>
            {currentMeals.map(meal => {
              const inCart = cart.some(c => c.idMeal === meal.idMeal);
              return (
                <div key={meal.idMeal} onClick={() => toggleCart(meal)}
                  style={{ cursor: "pointer", position: "relative", transition: "transform 0.15s", transform: inCart ? "scale(0.96)" : "scale(1)" }}>
                  {inCart && (
                    <div style={{ position: "absolute", top: 6, right: 6, zIndex: 2, width: 22, height: 22, borderRadius: "50%", background: "#242D96", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(36,45,150,0.4)" }}>
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  )}
                  <div style={{ borderRadius: 10, overflow: "hidden", border: `2px solid ${inCart ? "#242D96" : "transparent"}`, transition: "border-color 0.2s" }}>
                    <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", display: "block" }} />
                  </div>
                  <p style={{ marginTop: 8, marginBottom: 0, textAlign: "center", color: "#242D96", fontFamily: "Teachers, sans-serif", fontSize: 13, fontWeight: inCart ? 600 : 400 }}>
                    {fmt(meal.strMeal)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div style={{ marginTop: 40 }}>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        )}

        {/* Find stores button */}
        {!showStoresSection && (
          <div style={{ marginTop: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🗺️</div>
            <p style={{ color: "#788CA5", fontSize: 14, margin: 0, textAlign: "center" }}>Got your list? Find stores near you to buy ingredients</p>
            <button onClick={() => setShowStoresSection(true)}
              style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10, background: "white", color: "#242D96", border: "2px solid #242D96", borderRadius: 50, padding: "12px 28px", cursor: "pointer", fontFamily: "Teachers, sans-serif", fontSize: 15, fontWeight: 500 }}>
              🛒 Find Nearby Stores
            </button>
          </div>
        )}

        {/* Stores section */}
        {showStoresSection && (
          <div ref={storesSectionRef} style={{ marginTop: 64 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
              <div>
                <h2 style={{ color: "#242D96", fontFamily: "Taviraj, serif", fontSize: 28, fontWeight: 500, margin: "0 0 6px" }}>Nearby Stores</h2>
                <p style={{ color: "#788CA5", fontSize: 14, margin: 0 }}>Supermarkets and grocery stores near you</p>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { userLocRef.current = null; setLocationError(null); setStores([]); destroyMap(); setTimeout(() => initMapWithLocation(), 100); }}
                  style={{ background: "#f0f4ff", border: "1px solid #242D96", borderRadius: 50, padding: "6px 16px", cursor: "pointer", color: "#242D96", fontSize: 13, fontFamily: "Teachers, sans-serif" }}>
                  🔄 Refresh
                </button>
                <button onClick={() => setShowStoresSection(false)}
                  style={{ background: "none", border: "1px solid #BBC8D8", borderRadius: 50, padding: "6px 16px", cursor: "pointer", color: "#788CA5", fontSize: 13, fontFamily: "Teachers, sans-serif" }}>
                  Hide map
                </button>
              </div>
            </div>

            {locationError && (
              <div style={{ background: "#FFF3CC", border: "1px solid #FFD700", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#B8860B" }}>⚠️ {locationError}</div>
            )}

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 360px", minWidth: 280, height: 500, borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(36,45,150,0.12)", border: "2px solid #e8ecf8", position: "relative" }}>
                <div style={{ position: "absolute", top: 12, left: 12, zIndex: 1000, background: "rgba(255,255,255,0.96)", borderRadius: 12, padding: "7px 14px", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#242D96" }} />
                  <span style={{ color: "#242D96", fontSize: 12, fontWeight: 600, fontFamily: "Teachers, sans-serif" }}>YouChef Map</span>
                </div>
                {storesLoading && (
                  <div style={{ position: "absolute", top: 12, right: 12, zIndex: 1000, background: "rgba(255,255,255,0.92)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#242D96", fontFamily: "Teachers, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid #242D96", borderTopColor: "transparent", animation: "spin 0.8s linear infinite" }} />
                    Searching...
                  </div>
                )}
                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>

              <div style={{ flex: "0 0 300px", minWidth: 260, maxHeight: 500, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
                {storesLoading ? (
                  <div style={{ textAlign: "center", padding: 40 }}>
                    <div className="loader" style={{ margin: "0 auto 12px" }} />
                    <p style={{ color: "#788CA5", fontSize: 13, fontFamily: "Teachers, sans-serif" }}>Finding nearby stores...</p>
                  </div>
                ) : stores.length === 0 ? (
                  <div style={{ textAlign: "center", color: "#788CA5", padding: 40, fontSize: 14, fontFamily: "Teachers, sans-serif" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>🏪</div>
                    No stores found.<br />Try clicking 🔄 Refresh.
                  </div>
                ) : (
                  stores.map(store => (
                    <div key={store.id} onClick={() => focusStore(store)}
                      style={{ background: selectedStore === store.id ? "#f0f4ff" : "white", border: `1.5px solid ${selectedStore === store.id ? "#242D96" : "#e8ecf8"}`, borderRadius: 16, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: selectedStore === store.id ? "#242D96" : "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, transition: "all 0.2s" }}>
                          {typeEmoji(store.type)}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: selectedStore === store.id ? "#242D96" : "#343B1B", fontSize: 14, fontFamily: "Teachers, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{store.name}</p>
                          <p style={{ margin: "3px 0 0", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>📍 {store.dist < 1000 ? `${store.dist}m` : `${(store.dist / 1000).toFixed(1)}km`} away</p>
                          {store.address && <p style={{ margin: "3px 0 0", color: "#788CA5", fontSize: 12, fontFamily: "Teachers, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🗺 {store.address}</p>}
                          {store.hours && <p style={{ margin: "3px 0 0", color: "#029663", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>🕐 {store.hours}</p>}
                          {store.phone && <p style={{ margin: "3px 0 0", color: "#242D96", fontSize: 12, fontFamily: "Teachers, sans-serif" }}>📞 {store.phone}</p>}
                          {store.website && <a href={store.website} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={{ display: "block", margin: "3px 0 0", color: "#242D96", fontSize: 12, fontFamily: "Teachers, sans-serif", textDecoration: "underline", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>🌐 {store.website.replace(/^https?:\/\//, "")}</a>}
                        </div>
                        <div style={{ color: selectedStore === store.id ? "#242D96" : "#BBC8D8", fontSize: 18, flexShrink: 0 }}>›</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating cart */}
      {cart.length > 0 && (
        <button onClick={openModal} style={{ position: "fixed", bottom: 24, right: 24, zIndex: 100, width: 58, height: 58, borderRadius: "50%", background: "#242D96", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(36,45,150,0.4)" }}>
          <span style={{ fontSize: 22 }}>🛒</span>
          <span style={{ position: "absolute", top: -4, right: -4, background: "#FF786D", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>{cart.length}</span>
        </button>
      )}



      {/* Ticket modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: modalVisible ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0)", transition: "background 0.38s ease", display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 420, transform: modalVisible ? "translateY(0)" : "translateY(110%)", transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)" }}>
            <div style={{ margin: "0 16px" }} >
              <div style={{ background: "#242D96", borderRadius: "20px 20px 0 0", padding: "20px 24px 0" }}>
                <div style={{ width: 40, height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2, margin: "0 auto 20px" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, textTransform: "uppercase", letterSpacing: 3, margin: "0 0 4px" }}>YouChef</p>
                    <h2 style={{ color: "white", fontFamily: "Taviraj,serif", fontSize: 22, fontWeight: 500, margin: 0 }}>Shopping List</h2>
                  </div>
                  <button onClick={closeModal} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontSize: 22 }}>✕</button>
                </div>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 20, scrollbarWidth: "none" }}>
                  {cart.map(m => (
                    <div key={m.idMeal} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.12)", borderRadius: 30, padding: "4px 10px 4px 5px" }}>
                      <img src={m.strMealThumb} alt="" style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
                      <span style={{ color: "white", fontSize: 12, whiteSpace: "nowrap" }}>{m.strMeal}</span>
                      <button onClick={() => setCart(cart.filter(c => c.idMeal !== m.idMeal))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: "relative", background: "#FDFBE7", height: 26, display: "flex", alignItems: "center" }}>
                <div style={{ position: "absolute", left: -14, width: 28, height: 28, borderRadius: "50%", background: "#FDFBE7" }} />
                <div style={{ position: "absolute", right: -14, width: 28, height: 28, borderRadius: "50%", background: "#FDFBE7" }} />
                <div style={{ flex: 1, marginLeft: 14, marginRight: 14, borderTop: "2.5px dashed #BBC8D8" }} />
              </div>
              <div style={{ background: "white", borderRadius: "0 0 20px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-around", padding: "14px 24px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#242D96", fontSize: 22, fontWeight: 700, fontFamily: "Teachers,sans-serif" }}>{cart.length}</p>
                    <p style={{ margin: 0, color: "#788CA5", fontSize: 11, fontFamily: "Teachers,sans-serif" }}>Meals</p>
                  </div>
                  <div style={{ width: 1, background: "#f3f4f6" }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ margin: 0, color: "#242D96", fontSize: 22, fontWeight: 700, fontFamily: "Teachers,sans-serif" }}>{ingredientsList.length}</p>
                    <p style={{ margin: 0, color: "#788CA5", fontSize: 11, fontFamily: "Teachers,sans-serif" }}>Ingredients</p>
                  </div>
                </div>
                <div style={{ maxHeight: 260, overflowY: "auto", padding: "8px 24px" }}>
                  {ingredientsWithPrices.map(({ ingredient, measures, priceKZT }, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: idx < ingredientsWithPrices.length - 1 ? "1px solid #f9f9f9" : "none" }}>
                      <img src={`https://www.themealdb.com/images/ingredients/${ingredient}-small.png`} alt={ingredient} style={{ width: 32, height: 32, objectFit: "contain", flexShrink: 0 }} onError={e => { e.target.style.display = "none"; }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontWeight: 500, color: "#242D96", fontSize: 13, fontFamily: "Teachers,sans-serif" }}>{ingredient}</p>
                        {measures.filter(Boolean).length > 0 && <p style={{ margin: 0, color: "#788CA5", fontSize: 11, fontFamily: "Teachers,sans-serif" }}>{measures.filter(Boolean).join(" + ")}</p>}
                      </div>
                      {priceKZT && (
                        <span style={{ fontSize: 12, color: "#788CA5", fontFamily: "Teachers,sans-serif", flexShrink: 0 }}>
                          ~{convertPrice(priceKZT)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ position: "relative", height: 26, display: "flex", alignItems: "center" }}>
                  <div style={{ position: "absolute", left: -14, width: 28, height: 28, borderRadius: "50%", background: "#FDFBE7" }} />
                  <div style={{ position: "absolute", right: -14, width: 28, height: 28, borderRadius: "50%", background: "#FDFBE7" }} />
                  <div style={{ flex: 1, marginLeft: 14, marginRight: 14, borderTop: "2.5px dashed #e5e7eb" }} />
                </div>
                {totalKZT > 0 && (
                  <div style={{ margin: "8px 24px 0", background: "#EEF0FB", borderRadius: 12, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 11, color: "#788CA5", fontFamily: "Teachers,sans-serif" }}>~Примерная стоимость</p>
                      <p style={{ margin: "2px 0 0", fontSize: 10, color: "#BBC8D8", fontFamily: "Teachers,sans-serif" }}>по ценам {currency === "KZT" ? "Алматы" : currency === "RUB" ? "Москвы" : "региона"}</p>
                    </div>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#242D96", fontFamily: "Teachers,sans-serif" }}>{convertPrice(totalKZT)}</p>
                  </div>
                )}
                <div style={{ padding: "12px 24px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <svg width="200" height="44" viewBox="0 0 200 44">
                    {Array.from({ length: 40 }, (_, i) => {
                      const x = i * 5; const h = 28 + Math.sin(i * 1.9 + 0.5) * 10; const w = i % 4 === 0 ? 3 : i % 2 === 0 ? 2 : 1;
                      return <rect key={i} x={x} y={44 - h} width={w} height={h} fill="#242D96" opacity={0.6 + (i % 4) * 0.1} />;
                    })}
                  </svg>
                  <p style={{ margin: 0, color: "#BBC8D8", fontSize: 10, letterSpacing: 4, fontFamily: "monospace" }}>{ticketId}</p>
                </div>
                <div style={{ padding: "8px 24px 24px", display: "flex", gap: 10 }}>
                  <button onClick={copyList} style={{ flex: 1, padding: "11px", borderRadius: 50, border: "1px solid #BBC8D8", background: copied ? "#f0f4ff" : "white", color: "#242D96", cursor: "pointer", fontFamily: "Teachers,sans-serif", fontSize: 14, transition: "all 0.2s" }}>{copied ? "✓ Copied!" : "Copy List"}</button>
                  <button onClick={downloadList} style={{ flex: 1, padding: "11px", borderRadius: 50, border: "none", background: "#242D96", color: "white", cursor: "pointer", fontFamily: "Teachers,sans-serif", fontSize: 14, fontWeight: 500 }}>Download PDF</button>
                </div>
              </div>
            </div>
            <div style={{ height: 24 }} />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default MealPlanner;