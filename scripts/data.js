/**
 * NOSSA HISTÓRIA ❤️
 * Lista oficial das 25 Experiências Românticas e Configurações Iniciais
 */

const INITIAL_EXPERIENCES = [
  {
    id: 1,
    title: "Recriem o primeiro encontro de vocês.",
    category: "Nostalgia",
    icon: "sparkles",
    description: "Voltem ao lugar onde tudo começou ou recriem as roupas, as piadas e a atmosfera daquele primeiro dia tão especial.",
    romanticTip: "Tente lembrar das primeiras impressões que tiveram um do outro e compartilhem como o amor amadureceu desde então."
  },
  {
    id: 2,
    title: "Cada um escolha um lugar surpresa para o outro.",
    category: "Aventura",
    icon: "compass",
    description: "Um date em duas partes: um de vocês escolhe o destino da tarde e o outro comanda a noite, mantendo o suspense até chegarem lá.",
    romanticTip: "Vale um café aconchegante, um mirante da cidade ou aquele cantinho que seu amor sempre quis conhecer."
  },
  {
    id: 3,
    title: "Façam um piquenique ao pôr do sol.",
    category: "Romântico",
    icon: "sunset",
    description: "Toalha estendida na grama ou na praia, petiscos favoritos, suco ou vinho e o céu mudando de cor enquanto vocês conversam.",
    romanticTip: "Levem uma caixinha de som baixinha e aproveitem para registrar a silhueta de vocês contra o pôr do sol."
  },
  {
    id: 4,
    title: "Cozinhem um prato que nunca fizeram.",
    category: "Gastronomia",
    icon: "utensils",
    description: "Escolham uma receita desafiadora, coloquem música na cozinha, dividam as funções e divirtam-se com o processo (mesmo que queime um pouco!).",
    romanticTip: "O segredo não é a perfeição do prato, mas as risadas compartilhadas provando os temperos."
  },
  {
    id: 5,
    title: "Criem uma playlist da história de vocês.",
    category: "Música",
    icon: "music",
    description: "Reúnam as músicas que marcaram desde o início do namoro, viagens, momentos engraçados e canções que fazem um lembrar do outro.",
    romanticTip: "Ouçam juntos no carro ou no escuro da sala, relembrando a memória exata de cada faixa."
  },
  {
    id: 6,
    title: "Façam uma sessão de fotos juntos.",
    category: "Memórias",
    icon: "camera",
    description: "Seja com câmera ou celular no tripé, vistam algo especial ou fofo e tirem fotos espontâneas, abraçados, rindo e se olhando nos olhos.",
    romanticTip: "Fotos sem pose ensaiada costumam se tornar as mais preciosas ao longo dos anos."
  },
  {
    id: 7,
    title: "Troquem cartas sem avisar um ao outro.",
    category: "Romântico",
    icon: "mail",
    description: "Escrevam à mão palavras sinceras sobre o que sentem, agradecimentos e planos para o futuro. Deixem em um lugar surpresa.",
    romanticTip: "Coloque perfume na folha ou dobre de uma maneira especial para guardar para sempre nesta agenda."
  },
  {
    id: 8,
    title: "Façam um date com apenas R$20.",
    category: "Criatividade",
    icon: "coin",
    description: "Um desafio de criatividade e cumplicidade: usem R$20 para todo o encontro (picolé na praça, pipoca, pastel de feira ou bala no parque).",
    romanticTip: "Mostra que a melhor parte de estar junto não tem preço."
  },
  {
    id: 9,
    title: "Escolham um filme pela capa.",
    category: "Divertido",
    icon: "film",
    description: "Vão ao catálogo do streaming ou locadora e escolham um filme totalmente desconhecido apenas pela foto ou sinopse mais curiosa.",
    romanticTip: "Preparem pipoca doce e salgada e comentem as cenas mais inesperadas juntos."
  },
  {
    id: 10,
    title: "Visitem um lugar da cidade onde nunca foram.",
    category: "Aventura",
    icon: "map-pin",
    description: "Aquele museu, parque, bairro histórico, feirinha ou café que sempre comentavam mas nunca tinham tido tempo de visitar.",
    romanticTip: "Descobrir novidades lado a lado renova o olhar sobre a própria cidade e sobre a vida a dois."
  },
  {
    id: 11,
    title: "Façam uma competição de sobremesas.",
    category: "Gastronomia",
    icon: "cake",
    description: "Cada um fica responsável por preparar uma sobremesa ou montar uma taça doce. No final, provem as duas e votem com beijos de nota!",
    romanticTip: "Vale chantilly, morangos, brigadeiro e muita bagunça carinhosa."
  },
  {
    id: 12,
    title: "Criem um jantar temático em casa.",
    category: "Gastronomia",
    icon: "globe",
    description: "Escolham um país (Itália, México, Japão, França) e façam a comida, a trilha sonora e pequenos detalhes de decoração combinando.",
    romanticTip: "Vistam-se combinando com o tema para entrar no clima de viagem sem sair de casa."
  },
  {
    id: 13,
    title: "Passem uma noite sem celular.",
    category: "Conexão",
    icon: "phone-off",
    description: "Notificações silenciadas, telas guardadas na gaveta. Uma noite inteira dedicada apenas a conversar, jogar, rir e se conectar profundamente.",
    romanticTip: "Usem velas para iluminar e descubram o quanto o tempo rende quando a atenção é 100% de vocês."
  },
  {
    id: 14,
    title: "Recriem uma foto antiga de vocês.",
    category: "Nostalgia",
    icon: "image",
    description: "Encontrem uma foto do início do relacionamento e tentem imitar a mesma pose, roupa, expressão facial e enquadramento nos dias de hoje.",
    romanticTip: "Coloquem as duas fotos lado a lado no mural de memórias para celebrar a evolução do amor."
  },
  {
    id: 15,
    title: "Cada um compre uma surpresa de até R$10.",
    category: "Criatividade",
    icon: "gift",
    description: "Vão a uma loja ou mercado com 15 minutos para cada um encontrar algo simbólico, engraçado ou fofo dentro do limite de R$10.",
    romanticTip: "O valor está no significado, na piada interna ou no carinho por trás da escolha."
  },
  {
    id: 16,
    title: "Façam um passeio seguindo apenas moedas: cara = direita, coroa = esquerda.",
    category: "Aventura",
    icon: "shuffle",
    description: "Saiam a pé ou de carro sem destino prévio. Em cada esquina ou bifurcação, joguem uma moeda para decidir a direção.",
    romanticTip: "Parem no primeiro lugar bonito ou café curioso onde a moeda levar vocês."
  },
  {
    id: 17,
    title: "Escolham uma atividade que nenhum dos dois sabe fazer.",
    category: "Aprendizado",
    icon: "award",
    description: "Pintura em aquarela, cerâmica, andar de patins, dança de salão, origami ou escalada. Sejam iniciantes juntos!",
    romanticTip: "Rir dos próprios erros e aprender algo novo em dupla fortalece a cumplicidade."
  },
  {
    id: 18,
    title: "Façam um café da manhã juntos à noite.",
    category: "Divertido",
    icon: "coffee",
    description: "Invertam a rotina: panquecas quentinhas, ovos mexidos, café passado, frutas, waffles ou pão quentinho servidos às 21h em pijamas.",
    romanticTip: "Comam na cama ou no tapete da sala assistindo a uma série aconchegante."
  },
  {
    id: 19,
    title: "Montem uma cápsula do tempo.",
    category: "Memórias",
    icon: "archive",
    description: "Guardem ingressos, fotos, bilhetes, expectativas para daqui a 1, 5 ou 10 anos e uma carta para abrirem em uma data futura escolhida.",
    romanticTip: "Escrevam como imaginam suas vidas no futuro e fechem com carinho e fita."
  },
  {
    id: 20,
    title: "Façam uma lista de 20 coisas que querem viver juntos.",
    category: "Sonhos",
    icon: "list-checks",
    description: "Sentem-se com caneta e papel (ou registrem nas notas desta experiência) e sonhem alto: viagens, conquistas, tradições e aventuras.",
    romanticTip: "Sonhar em conjunto é uma das formas mais bonitas de construir um futuro sólido."
  },
  {
    id: 21,
    title: "Vão a um restaurante escolhido no cara ou coroa.",
    category: "Gastronomia",
    icon: "utensils",
    description: "Cada um sugere um restaurante ou tipo de comida que adora. A moeda decide quem venceu a rodada, sem choro e com muito apetite!",
    romanticTip: "O que perdeu tem direito a escolher a sobremesa!"
  },
  {
    id: 22,
    title: "Cada um escolha uma música para o outro dançar.",
    category: "Música",
    icon: "music",
    description: "Pode ser uma música romântica de rosto colado na sala de estar ou um ritmo super animado para dançar de meia no chão escorregadio.",
    romanticTip: "Deixem a vergonha de lado e aproveitem a sensação gostosa de dançar nos braços um do outro."
  },
  {
    id: 23,
    title: "Façam um date de turistas na própria cidade.",
    category: "Aventura",
    icon: "compass",
    description: "Ajam como se tivessem acabado de pousar na cidade: tirem fotos clichês em pontos turísticos, comprem lembrancinhas e peçam informações.",
    romanticTip: "Muitas vezes esquecemos de apreciar a beleza do lugar onde vivemos e nos apaixonamos."
  },
  {
    id: 24,
    title: "Criem uma tradição que será só de vocês.",
    category: "Conexão",
    icon: "heart-handshake",
    description: "Pode ser pizza toda sexta-feira à noite, assistir ao primeiro pôr do sol de cada mês, um brinde especial ou um abraço de 1 minuto ao acordar.",
    romanticTip: "Pequenos rituais diários e semanais são a cola invisível que mantém casais apaixonados."
  },
  {
    id: 25,
    title: "Perguntem um ao outro: \"Qual momento nosso você viveria de novo?\"",
    category: "Romântico",
    icon: "heart",
    description: "Uma conversa sincera, calma e profunda para revisitar as melhores lembranças da história de vocês e agradecer por cada capítulo.",
    romanticTip: "Preparem um vinho ou chá quentinho, olhem-se nos olhos e escutem com o coração."
  }
];

const DEFAULT_SETTINGS = {
  coupleNames: "Nós Dois",
  partner1: "Amor",
  partner2: "Amor",
  anniversaryDate: "", // YYYY-MM-DD
  coverPhoto: "",
  theme: "wine-romantic",
  quote: "Não queremos apenas passar o tempo juntos. Queremos ter histórias para contar sobre ele."
};
