"""
The client's product list (Ophelia - PRODUTOS SITE.odt) as data, and the
Shopify product CSV generated from it.

    python3 docs/shopify-import/products.py   # writes produtos.csv

Image URLs point at /shopify-import/ on the live site, where the photos are
published only long enough for Shopify to copy them into its own CDN.
"""
import csv, html, os

SITE = "https://ophelia-final.vercel.app/shopify-import"
HERE = os.path.dirname(os.path.abspath(__file__))

def body(*paras, ingredients=None):
    out = "".join(f"<p>{html.escape(p)}</p>" for p in paras)
    if ingredients:
        out += f"<p><strong>Ingredientes:</strong> {html.escape(ingredients)}</p>"
    return out

COOKIE_PACK = ("Os cookies são embalados individualmente em saquinhos de celofane com o nosso adesivo "
               "exclusivo e colocados nas nossas lindas caixas azuis ou brancas. É o presente perfeito!")
MONTANHA = ("A Ophelia nasceu numa pequena cidade do interior do país, a Guarda. Três irmãos e um sonho em "
            "comum — tornar a Ophelia num lugar feliz! Por isso, trouxemos o que há de melhor na montanha.")
DOCES = MONTANHA + (" Criámos 4 sabores únicos de doces caseiros, feitos apenas com fruta e açúcar, "
                    "de forma totalmente artesanal.")
CAFE = ("O nosso blend exclusivo combina o melhor de dois mundos: 70% Brasil e 30% Etiópia, criando uma "
        "chávena equilibrada e aromática. Do Brasil vêm as notas suaves, achocolatadas e de frutos secos; da "
        "Etiópia, a elegância floral e os toques cítricos. O resultado é um café harmonioso, com doçura "
        "natural, corpo médio e um aroma vibrante. É torrado na nossa loja, todos os dias, por nós!")
MEL_NOTE = "A cristalização do mel é a garantia da sua pureza; pode ser desfeita aquecendo o frasco em banho-maria a 40 graus."

# status: active = complete in the client's list; draft = something in the list
# is missing or contradictory, so it waits for the client before going live.
P = [
  dict(handle="ophelia-cookies-ny", title="Ophelia Cookies NY", type="Cookies", collection="cookies", status="active",
       body=body("As famosas cookies da Ophelia — directo da nossa cozinha para a sua casa. Cada caixa de presente é preparada sob encomenda e contém 6, 8 ou 12 dos nossos deliciosos cookies caseiros.", COOKIE_PACK,
                 ingredients="Farinha, chocolate 70%, chocolate 36,5%, manteiga, açúcar amarelo, açúcar branco, ovos, gemas, baunilha, bicarbonato, fermento e sal. Cada cookie tem 150 g."),
       option="Quantidade", variants=[("6 unidades", "30.00"), ("8 unidades", "40.00"), ("12 unidades", "60.00")],
       images=["00068", "00069", "00066"]),
  dict(handle="ophelia-cookies", title="Ophelia Cookies", type="Cookies", collection="cookies", status="active",
       body=body("As famosas cookies da Ophelia — directo da nossa cozinha para a sua casa. Cada caixa de presente é preparada sob encomenda e contém 4, 8 ou 12 dos nossos deliciosos cookies caseiros.", "Sabores disponíveis: tradicional, red velvet, cacau e limão.", COOKIE_PACK,
                 ingredients="Farinha, chocolate 70%, chocolate 36,5%, chocolate branco, manteiga, açúcar amarelo, açúcar branco, ovos, gemas, baunilha, bicarbonato, fermento, sal, cacau, corante vermelho, leite em pó, amido de milho e limão. Cada cookie tem 100 g."),
       option="Quantidade", variants=[("4 unidades", "17.00"), ("8 unidades", "32.00"), ("12 unidades", "48.00")],
       images=["00067", "00062", "00060", "00065"]),
  dict(handle="cookiebrownie", title="Ophelia CookieBrownie", type="Cookies", collection="cookies", status="active",
       body=body("As famosas cookies da Ophelia — directo da nossa cozinha para a sua casa. Cada caixa de presente é preparada sob encomenda e contém 4, 8 ou 12 cookies caseiros.", "A CookieBrownie é crocante por fora e muito cremosa por dentro. Não contém farinha.", COOKIE_PACK,
                 ingredients="Chocolate 70%, manteiga, açúcar, ovos e cacau. Cada cookie tem 100 g."),
       option="Quantidade", variants=[("4 unidades", "20.00"), ("8 unidades", "40.00"), ("12 unidades", "57.00")],
       images=["00064", "00063"]),
  dict(handle="cookie-banoffee", title="Ophelia Cookie Banoffee", type="Cookies", collection="cookies", status="active",
       body=body("As famosas cookies da Ophelia — directo da nossa cozinha para a sua casa. Cada caixa de presente é preparada sob encomenda e contém 4, 8 ou 12 cookies caseiros. A Cookie Banoffee é a grande novidade deste mês.", COOKIE_PACK,
                 ingredients="Chocolate de leite, açúcar mascavado, açúcar branco, manteiga, farinha, ovos, sal, bicarbonato, amido de milho, leite em pó, banana e doce de leite. Cada cookie tem 100 g."),
       option="Quantidade", variants=[("4 unidades", "20.00"), ("8 unidades", "40.00"), ("12 unidades", "57.00")],
       images=["00059", "00061"]),
  dict(handle="pack-especial-de-cookies", title="Pack Especial de Cookies Ophelia", type="Cookies", collection="cookies", status="active",
       body=body("As famosas cookies da Ophelia — directo da nossa cozinha para a sua casa. Cada caixa de presente é preparada sob encomenda e contém 3, 6 ou 9 cookies caseiros: Cookie Banoffee, CookieBrownie e Cookie Cheesecake.", COOKIE_PACK,
                 ingredients="Chocolate de leite, açúcar mascavado, açúcar branco, manteiga, farinha, ovos, sal, bicarbonato, amido de milho, leite em pó, banana, doce de leite, chocolate 70% e cacau. Cada cookie tem 100 g."),
       option="Quantidade", variants=[("3 unidades", "18.00"), ("6 unidades", "30.00"), ("9 unidades", "43.00")],
       images=["00057", "00058"]),
  dict(handle="cookies-personalizadas", title="Cookies Personalizadas", type="Cookies", collection="cookies", status="active",
       body=body("Para momentos especiais: as famosas cookies da Ophelia, personalizadas. Cada caixa é preparada sob encomenda, com um mínimo de 10 unidades e um mix de sabores.", "Os cookies são embalados individualmente em saquinhos de celofane com um adesivo personalizado — com a imagem ou o desenho que escolher — e colocados nas nossas caixas azuis ou brancas. Perfeito para o seu evento!",
                 ingredients="Farinha, chocolate 70%, chocolate 36,5%, chocolate branco, manteiga, açúcar amarelo, açúcar branco, ovos, gemas, baunilha, bicarbonato, fermento, sal, cacau, corante vermelho, leite em pó, amido de milho e limão. Cada cookie tem 60 g."),
       option="Quantidade", variants=[("10 unidades", "35.00"), ("25 unidades", "87.00"), ("35 unidades", "122.00"), ("50 unidades", "175.00")],
       images=["00055", "00014"]),
  dict(handle="azeite-da-ophelia", title="O Azeite da Ophelia", type="Mercearia", collection="mercearia", status="active",
       body=body(MONTANHA + " A boa comida tem a magia de nos confortar e de nos aquecer o coração — e Ophelia significa isso mesmo.", "Azeite virgem extra de oliveiras do sopé da Serra da Estrela.", ingredients="Azeite puro."),
       option="Tamanho", variants=[("750 ml", "19.90"), ("500 ml", "13.90")],
       images=["00050", "00049", "00047"]),
  dict(handle="mel-de-rosmaninho", title="O Mel de Rosmaninho", type="Mercearia", collection="mercearia", status="active",
       body=body(MONTANHA, "Este mel, com predominância polínica de rosmaninho, de tom claro-âmbar, suave e de textura fina e leve, é colhido entre Julho e Agosto.", MEL_NOTE, ingredients="Puro mel."),
       option="Tamanho", variants=[("300 ml", "7.80")],
       images=["00026", "00024"]),
  dict(handle="mel-de-castanheiro", title="O Mel de Castanheiro", type="Mercearia", collection="mercearia", status="active",
       body=body(MONTANHA, "O mel de castanheiro tem cor escura com notas avermelhadas e um sabor intenso, ligeiramente amargo.", MEL_NOTE, ingredients="Puro mel."),
       option="Tamanho", variants=[("300 ml", "7.80")],
       images=["00027", "00028"]),
  dict(handle="doce-de-alperce-e-amendoa", title="O Doce de Alperce e Amêndoa", type="Mercearia", collection="mercearia", status="active",
       body=body(DOCES, ingredients="Alperce, amêndoa, água, açúcar e limão."), option="Tamanho", variants=[("225 ml", "4.85")],
       images=["00023", "00022"]),
  dict(handle="doce-de-maca-e-vinho-do-porto", title="O Doce de Maçã e Vinho do Porto", type="Mercearia", collection="mercearia", status="active",
       body=body(DOCES, ingredients="Maçã, açúcar amarelo e vinho do Porto."), option="Tamanho", variants=[("225 ml", "4.85")],
       images=["00018", "00025"]),
  dict(handle="doce-de-pera-e-gengibre", title="O Doce de Pera e Gengibre", type="Mercearia", collection="mercearia", status="active",
       body=body(DOCES, ingredients="Pera rocha, gengibre e açúcar."), option="Tamanho", variants=[("225 ml", "4.85")],
       images=["00019", "00020"]),
  dict(handle="doce-de-morango-com-baunilha", title="O Doce de Morango com Baunilha", type="Mercearia", collection="mercearia", status="active",
       body=body(DOCES, ingredients="Morango, açúcar e vagem de baunilha."), option="Tamanho", variants=[("225 ml", "4.85")],
       images=["00002"]),
  dict(handle="granola-da-ophelia", title="A Granola da Ophelia", type="Mercearia", collection="mercearia", status="active",
       body=body("Diariamente, fazemos granola na Ophelia. O cheirinho de frutos secos caramelizados invade a nossa loja e ninguém lhe resiste.", "Feita de forma artesanal, apenas com aveia grossa, frutos secos, coco laminado, mel, canela e flocos de milho. É a melhor do mundo, podemos garantir!",
                 ingredients="Aveia, flocos de milho, noz, caju, pistácio, avelã, amêndoa, noz-pecã, coco laminado, mel e canela."),
       option="Tamanho", variants=[("300 g", "8.00"), ("600 g", "14.00")],
       images=["00040", "00046", "00042"]),
  dict(handle="cafe-da-ophelia-em-grao", title="Café da Ophelia em Grão", type="Mercearia", collection="mercearia", status="active",
       body=body(CAFE, ingredients="Grão de café: 70% Brasil, 30% Etiópia."), option="Tamanho", variants=[("250 g", "18.00")],
       images=["00045", "00043", "00048"]),
  dict(handle="vela-aromatica-croissant", title="Vela Aromática Croissant", type="Casa", collection="mercearia", status="active",
       body=body("Uma vela com o cheirinho dos nossos croissants. É delicioso — dá vontade de comer!"), option="Tamanho", variants=[("250 g", "18.00")],
       images=["00038", "00039", "00041"]),
  dict(handle="cartao-personalizado", title="Cartão Personalizado", type="Extras", collection=None, status="active",
       body=body("Junte um cartão à sua encomenda e escrevemos à mão a mensagem que quiser."), option=None, variants=[("Default Title", "4.00")],
       images=[]),
  # Waiting for the client: see LEIA-ME.md.
  dict(handle="kit-de-doces", title="Kit Especial de Doces", type="Mercearia", collection="mercearia", status="draft",
       body=body("Um kit especial com os nossos quatro doces caseiros: alperce e amêndoa, maçã e vinho do Porto, pera e gengibre, e morango com baunilha."),
       option="Tamanho", variants=[("4 × 225 ml", "18.00")], images=["00021"]),
  dict(handle="cafe-da-ophelia-moido", title="Café da Ophelia Moído", type="Mercearia", collection="mercearia", status="draft",
       body=body(CAFE, ingredients="Café moído: 70% Brasil, 30% Etiópia."), option="Tamanho", variants=[("250 g", "18.00")], images=["00048"]),
  dict(handle="chai-da-ophelia", title="Chai da Ophelia", type="Mercearia", collection="mercearia", status="draft",
       body=body("Descrição a enviar pela Ophelia."), option="Tamanho", variants=[("250 g", "18.00")], images=[]),
  dict(handle="matcha-da-ophelia", title="Matcha da Ophelia", type="Mercearia", collection="mercearia", status="draft",
       body=body("Descrição a enviar pela Ophelia."), option="Tamanho", variants=[("250 g", "18.00")], images=[]),
  dict(handle="avental-da-ophelia", title="Avental da Ophelia", type="Casa", collection="mercearia", status="draft",
       body=body("Queremos garantir que todos estão vestidos a rigor para fazer as suas melhores especialidades. Criámos um padrão único e muito divertido para que todos possam experimentar as nossas receitas e, principalmente, partilhá-las com a família.", ingredients="100% algodão."),
       option="Tamanho", variants=[("Tamanho único", "0.00")], images=[]),
]

HEADER = ["Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
          "Option1 Name", "Option1 Value", "Variant SKU", "Variant Grams", "Variant Inventory Tracker",
          "Variant Inventory Policy", "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price",
          "Variant Requires Shipping", "Variant Taxable", "Image Src", "Image Position", "Image Alt Text",
          "Gift Card", "Variant Weight Unit", "Status"]

def rows():
    for p in P:
        tags = ", ".join(t for t in [p["collection"], p["type"].lower()] if t)
        imgs = [f"{SITE}/{p['handle']}-{i + 1}.jpg" for i in range(len(p["images"]))]
        n = max(len(p["variants"]), len(imgs))
        for i in range(n):
            r = dict.fromkeys(HEADER, "")
            r["Handle"] = p["handle"]
            if i == 0:
                r.update({"Title": p["title"], "Body (HTML)": p["body"], "Vendor": "Ophelia", "Type": p["type"],
                          "Tags": tags, "Published": "TRUE" if p["status"] == "active" else "FALSE",
                          "Option1 Name": p["option"] or "Title", "Gift Card": "FALSE", "Status": p["status"]})
            if i < len(p["variants"]):
                value, price = p["variants"][i]
                r.update({"Option1 Value": value, "Variant SKU": f"{p['handle']}-{i + 1}", "Variant Grams": "0",
                          "Variant Inventory Policy": "continue", "Variant Fulfillment Service": "manual",
                          "Variant Price": price, "Variant Requires Shipping": "TRUE", "Variant Taxable": "TRUE",
                          "Variant Weight Unit": "g"})
            if i < len(imgs):
                r.update({"Image Src": imgs[i], "Image Position": str(i + 1), "Image Alt Text": p["title"]})
            yield r

if __name__ == "__main__":
    with open(os.path.join(HERE, "produtos.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=HEADER)
        w.writeheader()
        w.writerows(rows())
    # The photo list, for the image step.
    with open(os.path.join(HERE, "photos.txt"), "w") as f:
        for p in P:
            for i, n in enumerate(p["images"]):
                f.write(f"{n} {p['handle']}-{i + 1}.jpg\n")
    print(len(P), "products,", sum(len(p["variants"]) for p in P), "variants,", sum(len(p["images"]) for p in P), "photos")
