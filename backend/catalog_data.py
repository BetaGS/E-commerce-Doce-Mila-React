"""Catálogo da Doce Mila, transcrito dos cardápios em PDF (Kit Festa 2024,
Completo 2025 e Páscoa 2026). Preços em centavos.

Regras de leitura:
- price_cents = preço por unidade (itens vendidos "por cento" foram divididos por 100).
- price_cents = None  -> "sob consulta" (o cardápio não traz preço; vira orçamento no WhatsApp).
- price_from / variable_price -> cardápio diz "a partir de" / "valor pode variar".
- deposit_percent -> 50 (sinal) para encomendas; 100 para a Páscoa (pagamento integral).
"""

IMG = "/images/produtos/"


def single(key, label, choices, required=True, help=""):
    return {"key": key, "label": label, "type": "single", "choices": choices,
            "required": required, "help": help}


def multi(key, label, choices, min_=1, max_=2, help=""):
    return {"key": key, "label": label, "type": "multi", "choices": choices,
            "min": min_, "max": max_, "help": help}


def text(key, label, required=True, help=""):
    return {"key": key, "label": label, "type": "text", "required": required, "help": help}


TEMA = text("tema", "Tema da festa / personalização", True,
            "Ex.: Minnie vermelha, nome e idade do aniversariante.")

MASSAS_KIT = ["Baunilha", "Chocolate"]
RECHEIOS_KIT = [
    "Brigadeiro", "Doce de leite", "Doce de leite com coco", "Beijinho", "Brigadeiro branco",
    "Oreo", "Paçoca", "Leite ninho", "Limão siciliano", "Brigadeiro com geléia de morango",
    "Leite ninho com geléia de morango",
]
RECHEIOS_CUPCAKE_KIT = ["Brigadeiro", "Doce de leite", "Leite ninho", "Oreo", "Coco"]
DOCINHOS_KIT = ["Brigadeiro", "Beijinho", "Cajuzinho", "Casadinho"]

MASSAS_BOLO = ["Chocolate 50%", "Baunilha", "Cacau black", "Cenoura"]
RECHEIOS_TRAD = [
    "Brigadeiro", "Brigadeiro com geléia de morango", "Doce de leite", "Doce de leite com coco",
    "Coco", "Brigadeiro branco", "Limão siciliano", "Paçoca", "Oreo", "Baba de moça",
    "Leite Ninho", "Leite Ninho com geléia de morango",
]
RECHEIOS_PREMIUM = [
    "Cream cheese com goiabada", "Leite Ninho com Nutella", "Doce de leite com ameixa", "Nozes",
    "Ferrero Rocher", "Damasco", "Creme brûlée com frutas vermelhas",
    "Brigadeiro branco com geléia de frutas amarelas", "Maracujá",
]
TAMANHOS_BOLO = ["15cm (12 a 15 fatias)", "20cm (28 a 30 fatias)",
                 "25cm (42 a 45 fatias)", "30cm (52 a 55 fatias)"]

GOURMET = ["Churros", "Leite Ninho com Nutella", "Oreo", "Coco", "Paçoca", "Limão Siciliano",
           "Brigadeiro Belga", "Brigadeiro Branco", "Romeu e Julieta", "Crocante com Nutella", "M&M"]
TRADICIONAIS = ["Brigadeiro tradicional", "Beijinho", "Cajuzinho", "Casadinho"]
PREMIUM_BRIG = ["Brigadeiro de maracujá", "Kinder", "Oreo", "Meio Amargo", "Coco queimado",
                "Capuccino", "Pistache", "Coco com amêndoas", "KitKat", "Prestígio", "Confete",
                "Brûlée", "Nozes", "Torta de limão"]
DOCES_FINOS = ["Maracujá", "Pistache", "Nozes", "Damasco", "Creme brûlée com coulis de frutas vermelhas",
               "Romeu e Julieta", "Brigadeiro", "Leite Ninho com Nutella", "Brigadeiro Branco",
               "Limão siciliano", "Coco", "Doce de leite", "Avelã", "Amarula", "Banana caramelizada"]
VERRINES = ["Brownie com baba de moça", "Mousse de chocolate branco com frutas vermelhas", "3 chocolates",
            "Delícia de morango", "Cheesecake desconstruída de goiabada", "Cheesecake desconstruída de damasco",
            "Delícia de banana", "Mousse de pistache com framboesa", "Chocolate com avelã", "Capuccino",
            "Bolo desconstruído de churros", "Pistache com frutas vermelhas"]
BOMBOM_ABERTO = ["Oreo", "Brigadeiro com morango", "Crocante com Nutella", "Leite Ninho com morango",
                 "Prestígio", "Leite Ninho com Nutella"]
CUPCAKE_RECHEIOS = ["Brigadeiro", "Brigadeiro branco", "Leite Ninho", "Doce de leite", "Paçoca", "Oreo"]
TRUFADOS = ["Brigadeiro", "Oreo", "Paçoca", "Leite Ninho com Nutella", "Brigadeiro Branco", "Leite Ninho"]
TRUFINHAS = ["Brigadeiro", "Brigadeiro branco", "Leite Ninho", "Limão siciliano", "Oreo", "Paçoca",
             "Leite Ninho com Nutella", "Crocante"]

OVOS_TRAD = ["Brigadeiro ao leite", "Casadinho", "Pão de mel"]
OVOS_ESPECIAIS = ["Kinder", "Leite Ninho com Nutella", "Oreo", "Ferreiro"]
OVOS_FRUTAS = ["Kinder com morango", "Leite Ninho com geleia de frutas vermelhas", "Banoffe"]
PAVES = ["Pavê de Leite Ninho com Nutella", "Pavê de Leite Ninho com morango e Nutella",
         "Merengue de morango", "Torta de limão", "Pavê de Sonho de Valsa"]

CAT_KITS, CAT_BOLOS, CAT_DOCINHOS = "Kits Festa", "Bolos", "Docinhos"
CAT_FINOS, CAT_CUPS = "Doces Finos", "Cupcakes e Pão de Mel"
CAT_BROWNIES, CAT_CHOC, CAT_PASCOA = "Brownies e Bem-casados", "Chocolates Decorados", "Páscoa"

PASCOA_NOTE = "Cardápio de Páscoa 2026: encomendas até 27/03, entregas em 03/04 e 04/04."


def P(slug, name, category, description, image, price, **kw):
    d = dict(slug=slug, name=name, category=category, description=description, image=IMG + image,
             price_cents=price, gallery=[], notes="", price_note="", price_from=False,
             variable_price=False, min_qty=1, deposit_percent=50, options=[], active=True,
             is_new=False, availability_note="")
    d.update(kw)
    # Rótulo de preço padrão para itens vendidos por unidade (kits e Páscoa mostram só o valor)
    if (d["price_cents"] is not None and not d["price_note"] and d["category"] != CAT_PASCOA
            and not slug.startswith("kit-festa")):
        reais = f"{d['price_cents'] / 100:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        d["price_note"] = f"R$ {reais} a unidade"
    return d


PRODUCTS = [
    # ---------------------------------------------------------------- Kits Festa
    P("kit-festa-1", "Kit Festa 1", CAT_KITS,
      "Bolo de 15cm (12 a 15 fatias) com chantininho e papelaria personalizada, 6 cupcakes decorados em 2D "
      "no tema da festa e 25 docinhos (até 2 sabores).",
      "kit1-bolo.jpg", 35500, gallery=[IMG + "kit1-cupcakes.jpg"], variable_price=True,
      notes="Pode haver alteração no valor de acordo com a decoração escolhida. As forminhas seguem o tema.",
      options=[single("massa", "Massa do bolo e dos cupcakes", MASSAS_KIT),
               multi("recheio_bolo", "Recheio do bolo (até 2)", RECHEIOS_KIT, 1, 2),
               single("recheio_cupcake", "Recheio dos cupcakes", RECHEIOS_CUPCAKE_KIT),
               multi("docinhos", "Docinhos (até 2 sabores)", DOCINHOS_KIT, 1, 2), TEMA]),
    P("kit-festa-2", "Kit Festa 2", CAT_KITS,
      "Bolo de 20cm (28 a 30 fatias) com chantininho e papelaria personalizada, 12 cupcakes decorados em 2D "
      "no tema da festa e 50 docinhos (até 3 sabores).",
      "kit2-bolo.jpg", 56200, gallery=[IMG + "kit2-cupcakes.jpg"], variable_price=True,
      notes="Pode haver alteração no valor de acordo com a decoração escolhida. As forminhas seguem o tema.",
      options=[single("massa", "Massa do bolo e dos cupcakes", MASSAS_KIT),
               multi("recheio_bolo", "Recheio do bolo (até 2)", RECHEIOS_KIT, 1, 2),
               single("recheio_cupcake", "Recheio dos cupcakes", RECHEIOS_CUPCAKE_KIT),
               multi("docinhos", "Docinhos (até 3 sabores)", DOCINHOS_KIT, 1, 3), TEMA]),
    P("marmitinha-fatia", "Marmitinha para festa: fatia de bolo", CAT_KITS,
      "Fatia de bolo na marmitinha, com tampa personalizada no tema da festa.",
      "marmitinhas.jpg", 1250, min_qty=15, notes="Mínimo de 15 unidades.",
      options=[single("massa", "Massa do bolo", ["Baunilha", "Chocolate", "Cenoura"]),
               single("recheio", "Recheio do bolo", ["Brigadeiro", "Brigadeiro branco", "Oreo",
                                                      "Doce de leite", "Beijinho"]), TEMA]),
    P("marmitinha-fatia-docinhos", "Marmitinha para festa: fatia de bolo + 2 docinhos", CAT_KITS,
      "Fatia de bolo e 2 docinhos na marmitinha, com tampa personalizada no tema da festa.",
      "marmitinhas.jpg", 1700, min_qty=15, notes="Mínimo de 15 unidades.",
      options=[single("massa", "Massa do bolo", ["Baunilha", "Chocolate", "Cenoura"]),
               single("recheio", "Recheio do bolo", ["Brigadeiro", "Brigadeiro branco", "Oreo",
                                                      "Doce de leite", "Beijinho"]),
               multi("docinhos", "Sabores dos 2 docinhos", ["Brigadeiro", "Casadinho", "Beijinho", "Cajuzinho"], 1, 2),
               TEMA]),

    # -------------------------------------------------------------------- Bolos
    P("bolo-decorado", "Bolo decorado", CAT_BOLOS,
      "Bolos decorados sob medida para a sua comemoração, entregues em cakeboard branco. "
      "Escolha tamanho, massa e recheios e peça seu orçamento pelo WhatsApp.",
      "bolos-decorados.jpg", None, gallery=[IMG + "bolo-casamento.jpg"], variable_price=True,
      price_note="Sob consulta", notes="Os valores variam de acordo com a decoração. A linha premium tem acréscimo.",
      options=[single("tamanho", "Tamanho", TAMANHOS_BOLO),
               single("massa", "Massa", MASSAS_BOLO),
               multi("recheio", "Recheios tradicionais (até 2)", RECHEIOS_TRAD, 1, 2),
               multi("recheio_premium", "Recheios premium (até 2, com acréscimo)", RECHEIOS_PREMIUM, 0, 2), TEMA]),

    # ----------------------------------------------------------------- Docinhos
    P("docinhos-gourmet", "Docinhos gourmet", CAT_DOCINHOS,
      "Docinhos gourmet entregues em forminha pétala.", "docinhos-gourmet.jpg", 275,
      min_qty=25, price_note="R$ 275,00 o cento", notes="Mínimo de 25 unidades do mesmo sabor.",
      options=[single("sabor", "Sabor", GOURMET)]),
    P("docinhos-tradicionais", "Docinhos tradicionais", CAT_DOCINHOS,
      "Os clássicos de festa, entregues em forminha pétala.", "docinhos-tradicionais.jpg", 245,
      min_qty=25, price_note="R$ 245,00 o cento", notes="Mínimo de 25 unidades do mesmo sabor.",
      options=[single("sabor", "Sabor", TRADICIONAIS)]),
    P("docinhos-decorados", "Docinhos decorados", CAT_DOCINHOS,
      "Docinhos decorados no tema da festa, em forminha pétala. Peso aproximado de 16g, que pode variar "
      "conforme a decoração.", "docinhos-decorados.jpg", 345, min_qty=25, price_from=True,
      variable_price=True, price_note="a partir de R$ 345,00 o cento", notes="Mínimo de 25 unidades.",
      options=[single("sabor", "Sabor", ["Brigadeiro", "Brigadeiro branco"]), TEMA]),
    P("brigadeiros-premium", "Brigadeiros premium", CAT_DOCINHOS,
      "Brigadeiros premium em forminha pétala. Peso aproximado de 16g, que pode variar conforme a decoração.",
      "brigadeiros-premium.jpg", 315, min_qty=25, price_note="R$ 315,00 o cento",
      notes="Mínimo de 25 unidades do mesmo sabor.", options=[single("sabor", "Sabor", PREMIUM_BRIG)]),

    # -------------------------------------------------------------- Doces finos
    P("doces-finos", "Doces finos", CAT_FINOS, "Doces finos para mesas de festa e eventos.",
      "doces-finos.jpg", 435, min_qty=25, variable_price=True, price_note="R$ 435,00 o cento",
      notes="Mínimo de 25 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", DOCES_FINOS)]),
    P("verrine", "Verrine", CAT_FINOS, "Sobremesa no copinho, já acompanha colher.", "verrine.jpg", 1550,
      min_qty=12, notes="Mínimo de 12 unidades. Já acompanha colher.",
      options=[single("sabor", "Sabor", VERRINES)]),
    P("bombom-aberto", "Bombom aberto", CAT_FINOS, "Casquinha de chocolate com recheio cremoso.",
      "bombom-aberto.jpg", 1550, min_qty=6, variable_price=True,
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", BOMBOM_ABERTO)]),

    # ------------------------------------------------------ Brownies e bem-casados
    P("bem-casado", "Bem casado", CAT_BROWNIES, "Bem casado tradicional, embalado para lembrancinha.",
      "bem-casado.jpg", 590, min_qty=20, variable_price=True,
      notes="Mínimo de 20 unidades. O valor pode variar de acordo com a embalagem.",
      options=[single("sabor", "Sabor", ["Doce de leite", "Brigadeiro", "Baba de moça", "Limão siciliano",
                                         "Coco", "Nozes"])]),
    P("bem-vivido-de-brownie", "Bem vivido de brownie", CAT_BROWNIES, "Brownie tradicional embalado para lembrancinha.",
      "bem-vivido-brownie.jpg", 610, min_qty=25, variable_price=True,
      notes="Mínimo de 25 unidades. O valor pode variar de acordo com a embalagem.",
      options=[single("sabor", "Sabor", ["Doce de leite", "Brigadeiro", "Brigadeiro branco"])]),
    P("brownie-no-palito", "Brownie no palito", CAT_BROWNIES, "Brownie de brigadeiro no palito, decorado no tema da festa.",
      "brownie-palito.jpg", 1750, min_qty=6, variable_price=True,
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("recheio", "Recheio", ["Brigadeiro"]), TEMA]),
    P("brownie-3d", "Brownie 3D", CAT_BROWNIES, "Brownie de brigadeiro com decoração 3D.",
      "brownie-3d.jpg", 2200, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 22,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", ["Brigadeiro"]), TEMA]),

    # --------------------------------------------------- Cupcakes e pão de mel
    P("cupcake-decorado-2d", "Cupcake decorado 2D", CAT_CUPS, "Cupcake com decoração 2D no tema da festa.",
      "cupcakes.jpg", 1350, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 13,50 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("massa", "Massa", ["Baunilha", "Chocolate"]),
               single("recheio", "Recheio", CUPCAKE_RECHEIOS), TEMA]),
    P("cupcake-decorado-3d", "Cupcake decorado 3D", CAT_CUPS, "Cupcake com decoração 3D no tema da festa.",
      "cupcakes3d.jpg", 1990, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 19,90 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("massa", "Massa", ["Baunilha", "Chocolate"]),
               single("recheio", "Recheio", CUPCAKE_RECHEIOS), TEMA]),
    P("pao-de-mel-2d", "Pão de mel decorado 2D", CAT_CUPS, "Pão de mel recheado com doce de leite, decoração 2D.",
      "pao-de-mel.jpg", 1700, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 17,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("recheio", "Recheio", ["Doce de leite"]), TEMA]),
    P("pao-de-mel-3d", "Pão de mel decorado 3D", CAT_CUPS, "Pão de mel recheado com doce de leite, decoração 3D.",
      "pao-de-mel.jpg", 2200, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 22,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("recheio", "Recheio", ["Doce de leite"]), TEMA]),

    # ------------------------------------------------------ Chocolates decorados
    P("bolo-trufado", "Bolo trufado", CAT_CHOC, "Mini bolo trufado decorado.", "bolo-trufado.jpg", 1990,
      min_qty=6, price_from=True, variable_price=True, price_note="a partir de R$ 19,90 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", ["Brigadeiro", "Doce de leite"]), TEMA]),
    P("pirulito-de-chocolate", "Pirulito de chocolate", CAT_CHOC, "Pirulito de chocolate decorado.",
      "pirulito-chocolate.jpg", 1650, min_qty=6, variable_price=True,
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração. "
            "Celofane opcional: adicional de R$ 0,50 por unidade.",
      options=[single("sabor", "Chocolate", ["Ao leite", "Branco"]), TEMA]),
    P("copinho-de-chocolate-trufado", "Copinho de chocolate trufado", CAT_CHOC, "Copinho de chocolate recheado com trufa.",
      "copinho-trufado.jpg", 1700, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 17,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", ["Brigadeiro", "Brigadeiro branco"]), TEMA]),
    P("cone-trufado-decorado", "Cone trufado decorado", CAT_CHOC, "Cone trufado com decoração 3D.",
      "cone-trufado.jpg", 1990, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 19,90 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", ["Brigadeiro", "Oreo", "Paçoca", "Leite Ninho com Nutella",
                                         "Brigadeiro Branco", "Leite Ninho"]), TEMA]),
    P("trufinha-decoracao-topo", "Trufinha de chocolate (decoração no topo)", CAT_CHOC,
      "Trufinha de chocolate com decoração no topo.", "trufinhas.jpg", 950, min_qty=6, price_from=True,
      variable_price=True, price_note="a partir de R$ 9,50 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Recheio", TRUFINHAS), TEMA]),
    P("trufinha-personagem-3d", "Trufinha de chocolate com personagem 3D", CAT_CHOC,
      "Trufinha de chocolate com personagem 3D.", "trufinhas3d.jpg", 1990, min_qty=6, price_from=True,
      variable_price=True, price_note="a partir de R$ 19,90 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Recheio", TRUFINHAS), TEMA]),
    P("popsicle", "Popsicle de palha italiana", CAT_CHOC, "Popsicle de palha italiana decorado.",
      "popsicles.jpg", 1700, min_qty=6, price_from=True, variable_price=True,
      price_note="a partir de R$ 17,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("recheio", "Recheio", ["Palha italiana"]), TEMA]),
    P("bombom-trufado", "Bombom trufado", CAT_CHOC, "Bombom trufado decorado.", "bombom-trufado.jpg", 1200,
      min_qty=6, price_from=True, variable_price=True, price_note="a partir de R$ 12,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", ["Brigadeiro", "Oreo", "Leite Ninho com Nutella", "Brigadeiro Branco"]), TEMA]),
    P("bombom-simples", "Bombom simples", CAT_CHOC, "Bombom de chocolate simples.", "bombom-simples.jpg", 900,
      min_qty=10, price_from=True, variable_price=True, price_note="a partir de R$ 9,00 a unidade",
      notes="Mínimo de 10 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("sabor", "Sabor", TRUFADOS)]),
    P("pirulito-de-cristal", "Pirulito de cristal", CAT_CHOC, "Pirulito de cristal personalizado.",
      "pirulito-cristal.jpg", 1000, min_qty=10, price_from=True, variable_price=True,
      price_note="a partir de R$ 10,00 a unidade",
      notes="Mínimo de 10 unidades. O valor pode variar de acordo com a decoração.", options=[TEMA]),
    P("mini-donuts", "Mini donuts", CAT_CHOC, "Mini donuts cobertos com chocolate.", "mini-donuts.jpg", 950,
      min_qty=30, price_from=True, variable_price=True, price_note="a partir de R$ 9,50 a unidade",
      notes="Mínimo de 30 unidades. O valor pode variar de acordo com a decoração.", options=[TEMA]),
    P("cakepop", "Cakepop", CAT_CHOC, "Cakepop de massa baunilha, decorado.", "cakepop.jpg", 1200,
      min_qty=6, price_from=True, variable_price=True, price_note="a partir de R$ 12,00 a unidade",
      notes="Mínimo de 6 unidades. O valor pode variar de acordo com a decoração.",
      options=[single("recheio", "Recheio", ["Doce de leite", "Chocolate"]), TEMA]),
    P("doce-cenario", "Doce cenário", CAT_CHOC,
      "Casca de chocolate recheada com brownie, brigadeiro ao leite e leite ninho, com cenário decorado.",
      "doce-cenario.jpg", 4500, price_from=True, variable_price=True,
      price_note="a partir de R$ 45,00 a unidade",
      notes="O valor pode variar de acordo com a decoração.", options=[TEMA]),

    # -------------------------------------------------- Páscoa 2026 (encerrada)
    P("pascoa-caixinha-brigadeiro-belga", "Caixinha de brigadeiro belga", CAT_PASCOA,
      "Caixinha com 4 brigadeiros belga: 2 ao leite e 2 brancos.", "pascoa-caixinha-brigadeiro-belga.jpg",
      2500, deposit_percent=100, active=False, availability_note=PASCOA_NOTE),
    P("pascoa-cupcakes", "Cupcakes de Páscoa", CAT_PASCOA,
      "Embalagem com 4 cupcakes de cenoura ou chocolate, com cobertura de brigadeiro e confeito de chocolate.",
      "pascoa-cupcakes.jpg", 5400, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("massa", "Massa", ["Cenoura", "Chocolate"])]),
    P("pascoa-brigadeiro-belga", "Brigadeiro belga (lembrancinha)", CAT_PASCOA,
      "Nosso brigadeiro belga na versão lembrancinha.", "pascoa-brigadeiro-belga.jpg", 700,
      deposit_percent=100, active=False, availability_note=PASCOA_NOTE),
    P("pascoa-biscoito-de-chocolate", "Biscoito de chocolate", CAT_PASCOA,
      "4 biscoitos amanteigados com uma camada de chocolate nobre ao leite.", "pascoa-biscoito.jpg", 1800,
      deposit_percent=100, active=False, availability_note=PASCOA_NOTE),
    P("pascoa-mini-ovos-de-colher", "Mini ovos de colher", CAT_PASCOA,
      "Monte sua caixinha personalizada com 4 mini ovos de colher, com os sabores à sua escolha.",
      "pascoa-mini-ovos.jpg", 4500, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[multi("sabores", "Sabores (até 4)", OVOS_TRAD + OVOS_ESPECIAIS + OVOS_FRUTAS, 1, 4)]),
    P("pascoa-ovo-tradicional", "Ovo de colher tradicional (325g)", CAT_PASCOA,
      "Casca de chocolate ao leite recheada. O peso final pode variar de acordo com o sabor.",
      "pascoa-ovo-tradicional.jpg", 8200, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("sabor", "Sabor", OVOS_TRAD)]),
    P("pascoa-ovo-especial", "Ovo de colher especial (325g)", CAT_PASCOA,
      "Casca de chocolate recheada com sabores especiais. O peso final pode variar de acordo com o sabor.",
      "pascoa-ovo-especial.jpg", 11500, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("sabor", "Sabor", OVOS_ESPECIAIS)]),
    P("pascoa-ovo-com-frutas", "Ovo de colher com frutas (325g)", CAT_PASCOA,
      "Casca de chocolate recheada, com frutas. Consumo imediato. O peso final pode variar de acordo com o sabor.",
      "pascoa-ovo-frutas.jpg", 12500, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("sabor", "Sabor", OVOS_FRUTAS)]),
    P("pascoa-pave-p", "Pavê (P, 685g)", CAT_PASCOA, "Sobremesa em pote de 685g. O peso final pode variar de acordo com o sabor.",
      "pascoa-pave.jpg", 7000, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("sabor", "Sabor", PAVES)]),
    P("pascoa-pave-g", "Pavê (G, 1400g)", CAT_PASCOA, "Sobremesa em pote de 1400g. O peso final pode variar de acordo com o sabor.",
      "pascoa-pave.jpg", 11500, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("sabor", "Sabor", PAVES)]),
    P("pascoa-bolo-decorado", "Bolo decorado tema Páscoa (15cm)", CAT_PASCOA,
      "Bolo de 15cm (12/15 fatias), ótima opção para o domingo de Páscoa. Consulte as decorações disponíveis.",
      "pascoa-bolo.jpg", 24000, deposit_percent=100, active=False, availability_note=PASCOA_NOTE,
      options=[single("sabor", "Sabor", [
          "Malu: massa chocolate, recheio de leite ninho com Nutella",
          "Benício: massa cenoura, recheio de brigadeiro belga",
          "Cecília: massa chocolate 50%, recheio de brigadeiro ao leite e branco"])]),
]
