import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma";

const adapter = new PrismaLibSql({ url: "file:dev.db" });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  // ── Disciplina ────────────────────────────────────────────────
  const matematica = await prisma.disciplina.upsert({
    where: { nome: "Matemática" },
    update: {},
    create: { nome: "Matemática" },
  });

  // ── Tema ──────────────────────────────────────────────────────
  const temaAC = await prisma.tema.upsert({
    where: { nome_disciplinaId: { nome: "Análise Combinatória", disciplinaId: matematica.id } },
    update: {},
    create: { nome: "Análise Combinatória", disciplinaId: matematica.id },
  });

  // ── Subtemas ──────────────────────────────────────────────────
  const upsertSub = (nome: string) =>
    prisma.subtema.upsert({
      where: { nome_temaId: { nome, temaId: temaAC.id } },
      update: {},
      create: { nome, temaId: temaAC.id },
    });

  const subPM    = await upsertSub("Princípio da Multiplicação");
  const subFat   = await upsertSub("Fatorial");
  const subPerm  = await upsertSub("Permutação");
  const subComb  = await upsertSub("Combinação");
  const subArr   = await upsertSub("Arranjo");
  const subMisto = await upsertSub("Misto");

  // ── Helper ────────────────────────────────────────────────────
  type Alt = { letra: string; texto: string; correta: boolean };
  const criarQuestao = async (data: {
    enunciado: string;
    alternativas: Alt[];
    gabarito: string;
    resolucao: string;
    subtemaId: number;
    secao: string;
    dificuldade?: string;
    fonte?: string;
    anoFonte?: number;
  }) => {
    const q = await prisma.questao.create({
      data: {
        enunciado: data.enunciado,
        tipo: "multipla_escolha",
        dificuldade: data.dificuldade ?? "medio",
        secao: data.secao,
        fonte: data.fonte ?? "FDX Preparatório ANPAD",
        anoFonte: data.anoFonte ?? 2022,
        gabarito: data.gabarito,
        resolucao: data.resolucao,
        subtemaId: data.subtemaId,
        alternativas: {
          create: data.alternativas,
        },
      },
    });
    return q;
  };

  const FONTE = "FDX Preparatório ANPAD";
  const ANO = 2022;

  // ══════════════════════════════════════════════════════════════
  // PROBLEMAS 01–25
  // ══════════════════════════════════════════════════════════════

  await criarQuestao({
    enunciado: "Uma moça tem 5 blusas e 4 saias. De quantos modos distintos ela pode se vestir?",
    alternativas: [
      { letra: "A", texto: "9", correta: false },
      { letra: "B", texto: "15", correta: false },
      { letra: "C", texto: "20", correta: true },
      { letra: "D", texto: "25", correta: false },
      { letra: "E", texto: "30", correta: false },
    ],
    gabarito: "C",
    resolucao: "Escolha da blusa: 5 possibilidades. Escolha da saia: 4 possibilidades. Pelo Princípio da Multiplicação: N = 5 × 4 = 20.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Quantos números de dois algarismos podem ser formados no sistema decimal?",
    alternativas: [
      { letra: "A", texto: "10", correta: false },
      { letra: "B", texto: "30", correta: false },
      { letra: "C", texto: "50", correta: false },
      { letra: "D", texto: "70", correta: false },
      { letra: "E", texto: "90", correta: true },
    ],
    gabarito: "E",
    resolucao: "O 1º algarismo não pode ser 0 (9 possibilidades) e o 2º pode ser qualquer um dos 10 algarismos. N = 9 × 10 = 90.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Quantos números pares de dois algarismos distintos podem ser formados com os algarismos significativos?",
    alternativas: [
      { letra: "A", texto: "24", correta: false },
      { letra: "B", texto: "32", correta: true },
      { letra: "C", texto: "36", correta: false },
      { letra: "D", texto: "72", correta: false },
      { letra: "E", texto: "81", correta: false },
    ],
    gabarito: "B",
    resolucao: "Como o número tem que ser par, o último algarismo tem que ser par e diferente de 0 (2, 4, 6 ou 8): 4 possibilidades. O 1º algarismo pode ser qualquer um dos 9 algarismos significativos exceto o já escolhido: 8 possibilidades. N = 4 × 8 = 32.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Numa urna estão seis bolinhas, numeradas de 1 a 6. Serão sorteadas 3 dessas bolinhas para formar um número de três algarismos. Quantos números diferentes podem ser formados se, após cada sorteio, a bola sorteada é reposta na urna?",
    alternativas: [
      { letra: "A", texto: "216", correta: true },
      { letra: "B", texto: "240", correta: false },
      { letra: "C", texto: "496", correta: false },
      { letra: "D", texto: "720", correta: false },
      { letra: "E", texto: "729", correta: false },
    ],
    gabarito: "A",
    resolucao: "Como a bola é reposta, o número de possibilidades não se altera. N = 6 × 6 × 6 = 216.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Numa urna estão seis bolinhas, numeradas de 1 a 6. Serão sorteadas 3 dessas bolinhas para formar um número de três algarismos. Quantos números diferentes podem ser formados se, após cada sorteio, a bola sorteada não é reposta na urna?",
    alternativas: [
      { letra: "A", texto: "216", correta: false },
      { letra: "B", texto: "120", correta: true },
      { letra: "C", texto: "60", correta: false },
      { letra: "D", texto: "30", correta: false },
      { letra: "E", texto: "15", correta: false },
    ],
    gabarito: "B",
    resolucao: "Como a bola não é reposta, o número de possibilidades diminui 1 a cada vez. N = 6 × 5 × 4 = 120.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "A escrita Braille para cegos é um sistema de símbolos onde cada caractere é formado por uma matriz de 6 pontos dos quais pelo menos um se destaca em relação aos outros. Qual o número máximo de caracteres distintos que podem ser representados neste sistema de escrita?",
    alternativas: [
      { letra: "A", texto: "63", correta: true },
      { letra: "B", texto: "89", correta: false },
      { letra: "C", texto: "26", correta: false },
      { letra: "D", texto: "720", correta: false },
      { letra: "E", texto: "36", correta: false },
    ],
    gabarito: "A",
    resolucao: "Cada ponto pode ser destacado ou não (2 escolhas). Com 6 pontos: 2⁶ = 64 possibilidades. Subtraindo a escolha de não destacar nenhum ponto: N = 64 − 1 = 63.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Com os algarismos 3 e 4 é possível formar n sequências de 5 elementos cada uma. O valor de n é:",
    alternativas: [
      { letra: "A", texto: "10", correta: false },
      { letra: "B", texto: "12", correta: false },
      { letra: "C", texto: "16", correta: false },
      { letra: "D", texto: "24", correta: false },
      { letra: "E", texto: "32", correta: true },
    ],
    gabarito: "E",
    resolucao: "Cada posição pode ser preenchida de 2 modos (3 ou 4). n = 2 × 2 × 2 × 2 × 2 = 2⁵ = 32.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Quantos números de 3 algarismos distintos podemos formar, empregando os caracteres 1, 3, 5, 6, 8 e 9?",
    alternativas: [
      { letra: "A", texto: "60", correta: false },
      { letra: "B", texto: "120", correta: true },
      { letra: "C", texto: "240", correta: false },
      { letra: "D", texto: "40", correta: false },
      { letra: "E", texto: "80", correta: false },
    ],
    gabarito: "B",
    resolucao: "Como não se pode repetir os algarismos: 1º algarismo: 6 possibilidades, 2º: 5, 3º: 4. N = 6 × 5 × 4 = 120.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Para diminuir o emplacamento de carros roubados, um determinado país resolveu fazer um cadastro nacional, onde as placas são formadas com 3 letras seguidas de 4 algarismos, sendo que a 1ª letra da placa determina um estado deste país. Considerando o alfabeto com 26 letras, o número máximo de carros que cada estado poderá emplacar será de:",
    alternativas: [
      { letra: "A", texto: "175.760", correta: false },
      { letra: "B", texto: "409.500", correta: false },
      { letra: "C", texto: "6.500.000", correta: false },
      { letra: "D", texto: "6.760.000", correta: true },
      { letra: "E", texto: "175.760.000", correta: false },
    ],
    gabarito: "D",
    resolucao: "A 1ª letra é fixada pelo estado (1 possibilidade). As 2ª e 3ª letras: 26 cada. Os 4 algarismos: 10 cada. N = 1 × 26 × 26 × 10 × 10 × 10 × 10 = 26² × 10⁴ = 6.760.000.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Os números de quatro algarismos, divisíveis por 4, que podemos formar com os algarismos 1, 2, 3, 4 e 5, podendo haver repetição de algarismos, são em número de:",
    alternativas: [
      { letra: "A", texto: "20", correta: false },
      { letra: "B", texto: "40", correta: false },
      { letra: "C", texto: "75", correta: false },
      { letra: "D", texto: "205", correta: false },
      { letra: "E", texto: "125", correta: true },
    ],
    gabarito: "E",
    resolucao: "A condição para ser múltiplo de 4 é que os dois últimos algarismos formem um número múltiplo de 4. Com os algarismos 1, 2, 3, 4 e 5 podemos formar 5 múltiplos de 4 (12, 24, 32, 44 e 52). Os dois primeiros algarismos podem ser quaisquer: n = 5 × 5 × 5 = 125.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Quantos números de 4 algarismos podem ser formados com os 10 algarismos (0, 1, 2, ..., 9) se forem permitidas as repetições?",
    alternativas: [
      { letra: "A", texto: "4536", correta: false },
      { letra: "B", texto: "5454", correta: false },
      { letra: "C", texto: "8436", correta: false },
      { letra: "D", texto: "9000", correta: true },
      { letra: "E", texto: "10000", correta: false },
    ],
    gabarito: "D",
    resolucao: "O 1º algarismo não pode ser 0 (9 possibilidades). Os demais podem ser quaisquer 10. N = 9 × 10 × 10 × 10 = 9.000.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Assinale a alternativa na qual consta a quantidade de números inteiros formados por três algarismos distintos, escolhidos dentre 1, 3, 5, 7 e 9, e que são maiores que 200 e menores que 800.",
    alternativas: [
      { letra: "A", texto: "30", correta: false },
      { letra: "B", texto: "36", correta: true },
      { letra: "C", texto: "42", correta: false },
      { letra: "D", texto: "48", correta: false },
      { letra: "E", texto: "54", correta: false },
    ],
    gabarito: "B",
    resolucao: "Como o número deve estar entre 200 e 800, o 1º algarismo só pode ser 3, 5 ou 7 (3 possibilidades). O 2º: 4 possibilidades, o 3º: 3 possibilidades. N = 3 × 4 × 3 = 36.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Com os algarismos 1, 2, 3, 4, 5 e 6 formam-se números naturais de 6 algarismos distintos. Sabendo-se que neles não aparecem juntos dois algarismos pares nem dois algarismos ímpares, então o número total de naturais assim formados é:",
    alternativas: [
      { letra: "A", texto: "36", correta: false },
      { letra: "B", texto: "48", correta: false },
      { letra: "C", texto: "60", correta: false },
      { letra: "D", texto: "72", correta: true },
      { letra: "E", texto: "90", correta: false },
    ],
    gabarito: "D",
    resolucao: "Os algarismos pares e ímpares devem vir intercalados. Há duas possibilidades de disposição (P-I-P-I-P-I ou I-P-I-P-I-P), cada uma com 3 × 3 × 2 × 2 × 1 × 1 = 36 combinações. N = 2 × 36 = 72.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Determine quantos números de 3 algarismos podem ser formados com 1, 2, 3, 4, 5, 6 e 7, satisfazendo à seguinte regra: O número não pode ter algarismos repetidos, exceto quando iniciar com 1 ou 2, caso em que o 7 (e apenas o 7) pode aparecer mais de uma vez. Assinale o resultado obtido.",
    alternativas: [
      { letra: "A", texto: "204", correta: false },
      { letra: "B", texto: "206", correta: false },
      { letra: "C", texto: "208", correta: false },
      { letra: "D", texto: "210", correta: false },
      { letra: "E", texto: "212", correta: true },
    ],
    gabarito: "E",
    resolucao: "Números com 3 algarismos distintos: n₁ = 7 × 6 × 5 = 210. Para haver algarismos repetidos, o 1º algarismo só pode ser 1 ou 2, e o algarismo repetido deve ser o 7. Temos somente 2 possibilidades: 177 e 277. N = 210 + 2 = 212.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Observe o diagrama com os nós X, R, Y, S e Z, com ligações entre eles. O número de ligações distintas entre X e Z é:",
    alternativas: [
      { letra: "A", texto: "39", correta: false },
      { letra: "B", texto: "41", correta: true },
      { letra: "C", texto: "35", correta: false },
      { letra: "D", texto: "45", correta: false },
      { letra: "E", texto: "43", correta: false },
    ],
    gabarito: "B",
    resolucao: "Somando os caminhos possíveis de X para Z: XRZ: 3×1=3; XRYZ: 3×3×2=18; XYZ: 1×2=2; XSYZ: 3×2×2=12; XSZ: 3×2=6. Total N = 3+18+2+12+6 = 41.",
    subtemaId: subPM.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Se $a_n = \\dfrac{(n+1)! - n!}{n^2[(n-1)! + n!]}$, então $a_{2016}$ é:",
    alternativas: [
      { letra: "A", texto: "\\dfrac{2016}{2017}", correta: false },
      { letra: "B", texto: "\\dfrac{1}{2017}", correta: true },
      { letra: "C", texto: "2017!", correta: false },
      { letra: "D", texto: "2017", correta: false },
      { letra: "E", texto: "1", correta: false },
    ],
    gabarito: "B",
    resolucao: "Simplificando: $a_n = \\frac{1}{1+n}$. Para n = 2016: $a_{2016} = \\frac{1}{2017}$.",
    subtemaId: subFat.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Uma solução da equação $\\dfrac{1}{n!} - \\dfrac{1}{(n+1)!} = \\dfrac{1}{5(n-1)!}$ é:",
    alternativas: [
      { letra: "A", texto: "3", correta: false },
      { letra: "B", texto: "4", correta: true },
      { letra: "C", texto: "5", correta: false },
      { letra: "D", texto: "6", correta: false },
      { letra: "E", texto: "7", correta: false },
    ],
    gabarito: "B",
    resolucao: "Multiplicando por (n+1)!: $(n+1) - 1 = \\frac{(n+1)n}{5} \\Rightarrow n = \\frac{(n+1)n}{5}$. Como $n \\geq 1 \\Rightarrow 5 = n+1 \\Rightarrow n = 4$.",
    subtemaId: subFat.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Quantos anagramas da palavra SIMPLES começam e terminam pela letra S?",
    alternativas: [
      { letra: "A", texto: "5", correta: false },
      { letra: "B", texto: "24", correta: false },
      { letra: "C", texto: "120", correta: true },
      { letra: "D", texto: "360", correta: false },
      { letra: "E", texto: "720", correta: false },
    ],
    gabarito: "C",
    resolucao: "Como os anagramas começam e terminam com S, basta permutar as 5 letras restantes (I, M, P, L, E). N = P₅ = 5! = 120.",
    subtemaId: subPerm.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Um clube resolve fazer uma Semana de Cinema. Para isso, os organizadores escolhem sete filmes, que serão exibidos um por dia. Porém, ao elaborar a programação, eles decidem que três desses filmes, que são de ficção científica, devem ser exibidos em dias consecutivos. Nesse caso, o número de maneiras diferentes de se fazer a programação dessa semana é:",
    alternativas: [
      { letra: "A", texto: "144", correta: false },
      { letra: "B", texto: "576", correta: false },
      { letra: "C", texto: "720", correta: true },
      { letra: "D", texto: "1040", correta: false },
      { letra: "E", texto: "1200", correta: false },
    ],
    gabarito: "C",
    resolucao: "Tratando os 3 filmes de ficção como um bloco, temos 5 objetos. P₅ = 5! = 120 modos. Os 3 filmes de FC podem ser permutados: P₃ = 3! = 6. Total = 120 × 6 = 720.",
    subtemaId: subPerm.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Temos 10 livros, todos diferentes, sendo 3 de Matemática, 3 de Física e 4 de Química. De quantos modos podemos dispô-los em uma prateleira, de modo que os livros de cada matéria permaneçam juntos?",
    alternativas: [
      { letra: "A", texto: "108", correta: false },
      { letra: "B", texto: "864", correta: false },
      { letra: "C", texto: "5184", correta: true },
      { letra: "D", texto: "10800", correta: false },
      { letra: "E", texto: "10368", correta: false },
    ],
    gabarito: "C",
    resolucao: "Ordenação das matérias: P₃ = 3! = 6. Dentro de cada matéria: Matemática P₃ = 6, Física P₃ = 6, Química P₄ = 24. N = 6 × 6 × 6 × 24 = 5184.",
    subtemaId: subPerm.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Em uma Olimpíada, a delegação de um país A se apresentou com 10 atletas e a de um país B, com 6 atletas. Os alojamentos da Vila Olímpica eram para quatro pessoas, e um deles foi ocupado por 2 atletas de A e 2 atletas de B. O número de maneiras distintas de formar esse grupo de 4 atletas era:",
    alternativas: [
      { letra: "A", texto: "675", correta: true },
      { letra: "B", texto: "450", correta: false },
      { letra: "C", texto: "270", correta: false },
      { letra: "D", texto: "60", correta: false },
      { letra: "E", texto: "16", correta: false },
    ],
    gabarito: "A",
    resolucao: "Escolha dos 2 atletas de A: $C_{10}^2 = 45$. Escolha dos 2 atletas de B: $C_6^2 = 15$. N = 45 × 15 = 675.",
    subtemaId: subComb.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Quantas comissões de 6 pessoas podem ser formadas a partir de um grupo de 10 pessoas, dentre as quais se encontram João e Maria, de forma que João e Maria nunca pertençam à mesma comissão?",
    alternativas: [
      { letra: "A", texto: "210", correta: false },
      { letra: "B", texto: "140", correta: true },
      { letra: "C", texto: "126", correta: false },
      { letra: "D", texto: "112", correta: false },
      { letra: "E", texto: "70", correta: false },
    ],
    gabarito: "B",
    resolucao: "Total de comissões: $C_{10}^6 = 210$. Comissões com João e Maria juntos: $C_8^4 = 70$. N = 210 − 70 = 140.",
    subtemaId: subComb.id,
    secao: "problema",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Em um laboratório há 11 cientistas e 7 auxiliares de pesquisa. Quantas comissões de 5 desses elementos podem ser formadas, de modo que em cada comissão as duas categorias estejam representadas e os cientistas tenham maioria?",
    alternativas: [
      { letra: "A", texto: "2310", correta: false },
      { letra: "B", texto: "3465", correta: false },
      { letra: "C", texto: "5775", correta: true },
      { letra: "D", texto: "6237", correta: false },
      { letra: "E", texto: "7557", correta: false },
    ],
    gabarito: "C",
    resolucao: "4 cientistas e 1 auxiliar: $C_{11}^4 \\times C_7^1 = 330 \\times 7 = 2310$. 3 cientistas e 2 auxiliares: $C_{11}^3 \\times C_7^2 = 165 \\times 21 = 3465$. N = 2310 + 3465 = 5775.",
    subtemaId: subComb.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Pode-se formar uma comissão de 3 pessoas, escolhidas dentre p diretores de uma firma, de k maneiras distintas. Entretanto, havendo designações diferentes para as três pessoas da comissão, a escolha pode ser feita de k + 100 maneiras distintas. O valor de k é:",
    alternativas: [
      { letra: "A", texto: "16", correta: false },
      { letra: "B", texto: "18", correta: false },
      { letra: "C", texto: "20", correta: true },
      { letra: "D", texto: "22", correta: false },
      { letra: "E", texto: "24", correta: false },
    ],
    gabarito: "C",
    resolucao: "Combinação: $C_p^3 = k$. Arranjo: $A_p^3 = k + 100$. Como $A_p^3 = 6 \\cdot C_p^3$: $6k = k + 100 \\Rightarrow 5k = 100 \\Rightarrow k = 20$.",
    subtemaId: subArr.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Uma prova de atletismo é disputada por 9 atletas, dos quais apenas 4 são brasileiros. Os resultados possíveis para a prova, de modo que pelo menos um brasileiro fique numa das três primeiras colocações, são em número de:",
    alternativas: [
      { letra: "A", texto: "426", correta: false },
      { letra: "B", texto: "444", correta: true },
      { letra: "C", texto: "468", correta: false },
      { letra: "D", texto: "480", correta: false },
      { letra: "E", texto: "504", correta: false },
    ],
    gabarito: "B",
    resolucao: "Total de resultados: $A_9^3 = 504$. Resultados sem brasileiros: $A_5^3 = 60$. N = 504 − 60 = 444.",
    subtemaId: subArr.id,
    secao: "problema",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  // ══════════════════════════════════════════════════════════════
  // EXERCÍCIOS DE FIXAÇÃO 01–25
  // ══════════════════════════════════════════════════════════════

  await criarQuestao({
    enunciado: "Uma empresa de telefonia oferece a seus clientes sete cores diferentes de aparelhos celulares, podendo o comprador optar entre dois modelos diferentes. Sabendo-se que os aparelhos celulares podem ser habilitados em um dos planos: 'fale pouco', 'fale sempre' ou 'fale muito', então na compra de um celular o número de possibilidades diferentes que o comprador tem de escolha é:",
    alternativas: [
      { letra: "A", texto: "12", correta: false },
      { letra: "B", texto: "14", correta: false },
      { letra: "C", texto: "21", correta: false },
      { letra: "D", texto: "24", correta: false },
      { letra: "E", texto: "42", correta: true },
    ],
    gabarito: "E",
    resolucao: "Cor: 7 possibilidades. Modelo: 2. Plano: 3. N = 7 × 2 × 3 = 42.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Num restaurante, ao pedir um filet, o freguês deve escolher 3 dos 8 tipos diferentes de acompanhamento. Então, o número de opções distintas de acompanhamento que se pode escolher é:",
    alternativas: [
      { letra: "A", texto: "24", correta: false },
      { letra: "B", texto: "56", correta: true },
      { letra: "C", texto: "64", correta: false },
      { letra: "D", texto: "219", correta: false },
      { letra: "E", texto: "336", correta: false },
    ],
    gabarito: "B",
    resolucao: "A ordem não importa: $N = C_8^3 = \\frac{8!}{3! \\cdot 5!} = \\frac{8 \\times 7 \\times 6}{3 \\times 2} = 56$.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "A quantidade de números de dois dígitos cujo dígito das dezenas é múltiplo de 2 e o das unidades é múltiplo de 3 é:",
    alternativas: [
      { letra: "A", texto: "10", correta: false },
      { letra: "B", texto: "12", correta: false },
      { letra: "C", texto: "15", correta: false },
      { letra: "D", texto: "16", correta: true },
      { letra: "E", texto: "20", correta: false },
    ],
    gabarito: "D",
    resolucao: "Dezenas (par e ≠ 0): 2, 4, 6, 8 → 4 possibilidades. Unidades (múltiplo de 3): 0, 3, 6, 9 → 4 possibilidades. N = 4 × 4 = 16.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "A diretoria de uma empresa é formada por 10 diretores, sendo 6 brasileiros e 4 franceses. Considere as seguintes sentenças: I. O número de comissões de 5 diretores que podem ser formadas é 30.240. II. O número de comissões com 3 diretores brasileiros e 2 franceses é 120. III. Entre todas as possíveis comissões de 5 diretores, o número delas que possui pelo menos 1 diretor francês é 246. Associe V às verdadeiras e F às falsas.",
    alternativas: [
      { letra: "A", texto: "V, V, F", correta: false },
      { letra: "B", texto: "V, F, F", correta: false },
      { letra: "C", texto: "F, V, V", correta: true },
      { letra: "D", texto: "F, F, V", correta: false },
      { letra: "E", texto: "F, V, F", correta: false },
    ],
    gabarito: "C",
    resolucao: "I: FALSA — $C_{10}^5 = 252$, não 30.240. II: VERDADEIRA — $C_6^3 \\times C_4^2 = 20 \\times 6 = 120$. III: VERDADEIRA — $252 - C_6^5 = 252 - 6 = 246$.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Permutando os algarismos 2, 4, 5, 8 e 9 são formados números dispostos em ordem crescente. Então o lugar que o número 58.429 ocupa é o:",
    alternativas: [
      { letra: "A", texto: "48º", correta: false },
      { letra: "B", texto: "60º", correta: false },
      { letra: "C", texto: "62º", correta: false },
      { letra: "D", texto: "63º", correta: true },
      { letra: "E", texto: "65º", correta: false },
    ],
    gabarito: "D",
    resolucao: "Números menores que 58.429: começados por 2 ou 4 (2×4! = 48); começados por 5 com 2º dígito 2 ou 4 (2×3! = 12); começados por 58 com 3º dígito 2 (1×2! = 2). Total = 48+12+2 = 62. O número ocupa a 63ª posição.",
    subtemaId: subPerm.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Considere um conjunto não vazio e os seguintes casos: I. número de 'palavras' formadas com duas vogais não repetidas. II. número de fotografias tiradas de filas indianas formadas por 7 pessoas de um conjunto de 10. III. número de retas obtidas pela ligação de dois pontos tomados entre quatro pontos distintos A, B, C, D dos quais não há três colineares. IV. número de aplicações bijetoras de E={1,2,3,4} num conjunto F={a,b,c,d}. V. quantidade de números compreendidos entre 1.000 e 2.000, formados por algarismos distintos escolhidos entre 1, 3, 5, 7 e 9. Dessa forma, tem-se que:",
    alternativas: [
      { letra: "A", texto: "I, II e V são arranjos simples", correta: true },
      { letra: "B", texto: "I, II e III são arranjos simples", correta: false },
      { letra: "C", texto: "II, III e V são combinações simples", correta: false },
      { letra: "D", texto: "I, IV e V são permutações simples", correta: false },
      { letra: "E", texto: "III e V são combinações simples", correta: false },
    ],
    gabarito: "A",
    resolucao: "I: Arranjo (ordem importa, palavras diferentes). II: Arranjo (ordem importa, filas diferentes). III: Combinação (reta XY = reta YX). IV: Permutação (bijeção ordena F em relação a E). V: Arranjo (ordem importa, números diferentes). Logo I, II e V são arranjos simples.",
    subtemaId: subMisto.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Dez cavalos disputam um páreo. Então o número de possibilidades para classificação nos três primeiros lugares é:",
    alternativas: [
      { letra: "A", texto: "120", correta: false },
      { letra: "B", texto: "10! (fatorial de dez)", correta: false },
      { letra: "C", texto: "30", correta: false },
      { letra: "D", texto: "720", correta: true },
      { letra: "E", texto: "1200", correta: false },
    ],
    gabarito: "D",
    resolucao: "N = 10 × 9 × 8 = 720.",
    subtemaId: subArr.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Considere a palavra ESCOLA. Então o número de anagramas que começam com E; o número de anagramas que começam com E e terminam com A; o número de anagramas que têm a sílaba LA; e o número de anagramas que têm juntas as letras E e S são, respectivamente:",
    alternativas: [
      { letra: "A", texto: "120; 24; 120; 240", correta: true },
      { letra: "B", texto: "120; 120; 120; 120", correta: false },
      { letra: "C", texto: "720; 24; 120; 120", correta: false },
      { letra: "D", texto: "120; 120; 24; 24", correta: false },
      { letra: "E", texto: "120; 24; 24; 24", correta: false },
    ],
    gabarito: "A",
    resolucao: "Começam com E: P₅ = 5! = 120. Começam E e terminam A: P₄ = 4! = 24. Têm sílaba LA (bloco): P₅ = 5! = 120. Têm E e S juntas: 2 × P₅ = 2 × 5! = 240.",
    subtemaId: subPerm.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Um casal pretende ter três filhos. As possibilidades, quanto à sequência de sexo dos filhos, são em número de:",
    alternativas: [
      { letra: "A", texto: "3", correta: false },
      { letra: "B", texto: "4", correta: false },
      { letra: "C", texto: "6", correta: false },
      { letra: "D", texto: "7", correta: false },
      { letra: "E", texto: "8", correta: true },
    ],
    gabarito: "E",
    resolucao: "Cada filho tem 2 possibilidades de sexo. N = 2 × 2 × 2 = 8.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "As placas dos veículos são formadas por três letras seguidas de quatro algarismos. O número de placas que podem ser formadas com as letras A, B e C e os algarismos pares sem repetição de algarismos é:",
    alternativas: [
      { letra: "A", texto: "144", correta: false },
      { letra: "B", texto: "360", correta: false },
      { letra: "C", texto: "648", correta: false },
      { letra: "D", texto: "720", correta: false },
      { letra: "E", texto: "3240", correta: true },
    ],
    gabarito: "E",
    resolucao: "Letras (com repetição, A/B/C): 3³ = 27. Algarismos pares (0,2,4,6,8) sem repetição: 5×4×3×2 = 120. N = 27 × 120 = 3240.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Cartões numerados de 1 a 13 são impressos em 4 cores diferentes (azul, vermelho, verde e amarelo), formando 4 conjuntos de 13 cartões. De todos os 4 conjuntos de cartões misturados aleatoriamente, dois cartões são retirados em sequência e sem reposição. O número de maneiras distintas em que um cartão com o número 4 impresso em amarelo e um cartão com o número 10 impresso em azul podem ser retirados, nesta ordem, é dado por:",
    alternativas: [
      { letra: "A", texto: "52", correta: false },
      { letra: "B", texto: "51", correta: false },
      { letra: "C", texto: "52 × 51", correta: false },
      { letra: "D", texto: "2 × 52 × 51", correta: false },
      { letra: "E", texto: "1", correta: true },
    ],
    gabarito: "E",
    resolucao: "Há uma única hipótese para o 1º cartão (4 amarelo) e uma única possibilidade para o 2º cartão (10 azul). N = 1.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Uma empresa usa cinco dígitos para identificar os seus funcionários. Os dois primeiros dígitos são ocupados por vogais e os três últimos por algarismos. Supondo proibida a repetição de vogais, o número máximo de identidades que esta empresa pode fornecer é:",
    alternativas: [
      { letra: "A", texto: "14400", correta: false },
      { letra: "B", texto: "2400", correta: false },
      { letra: "C", texto: "1200", correta: false },
      { letra: "D", texto: "10000", correta: false },
      { letra: "E", texto: "20000", correta: true },
    ],
    gabarito: "E",
    resolucao: "Vogais sem repetição: 5×4 = 20. Algarismos (com repetição): 10³ = 1000. N = 20 × 1000 = 20.000.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Imediatamente após abrir as portas, uma loja de eletrodomésticos recebe 6 clientes. Se a loja possui 3 vendedores, e se cada vendedor atende a dois clientes simultaneamente, o número de maneiras distintas com que os seis clientes serão simultaneamente atendidos é:",
    alternativas: [
      { letra: "A", texto: "6!/3!", correta: false },
      { letra: "B", texto: "6!/(3!·3!)", correta: false },
      { letra: "C", texto: "6!/(3!·2!)", correta: false },
      { letra: "D", texto: "90", correta: true },
      { letra: "E", texto: "15", correta: false },
    ],
    gabarito: "D",
    resolucao: "1º vendedor escolhe 2 dos 6: $C_6^2 = 15$. 2º vendedor escolhe 2 dos 4 restantes: $C_4^2 = 6$. 3º vendedor fica com os 2 restantes: $C_2^2 = 1$. N = 15 × 6 × 1 = 90.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Sejam Y₁ e Y₂ duas retas paralelas. Selecionam-se 6 pontos sobre a reta Y₁ e 4 pontos sobre a reta Y₂. A seguir, constroem-se triângulos com vértices nos pontos selecionados. O número total de triângulos que podem ser construídos com vértices nos pontos selecionados é:",
    alternativas: [
      { letra: "A", texto: "46", correta: false },
      { letra: "B", texto: "96", correta: true },
      { letra: "C", texto: "120", correta: false },
      { letra: "D", texto: "136", correta: false },
      { letra: "E", texto: "148", correta: false },
    ],
    gabarito: "B",
    resolucao: "Total $C_{10}^3 = 120$. Não formam triângulos: 3 em Y₁ ($C_6^3 = 20$) ou 3 em Y₂ ($C_4^3 = 4$). N = 120 − (20 + 4) = 96.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Se A é um conjunto de 25 elementos, então o número de subconjuntos de A com 23 elementos que se pode formar é igual a:",
    alternativas: [
      { letra: "A", texto: "25!·23!", correta: false },
      { letra: "B", texto: "25·23!", correta: false },
      { letra: "C", texto: "25!/23!", correta: false },
      { letra: "D", texto: "25/23!", correta: false },
      { letra: "E", texto: "25!/(23!·2!)", correta: true },
    ],
    gabarito: "E",
    resolucao: "$N = C_{25}^{23} = C_{25}^2 = \\frac{25!}{23! \\cdot 2!}$.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Um barco é oferecido pelo fabricante em 8 cores diferentes e com 4 diferentes tipos de acabamento. Além disso, o comprador pode escolher para o barco um dentre 3 diferentes tipos de motor, cada um dos quais, por sua vez, pode ser movido a gasolina, ou a óleo diesel. O número total de opções de escolha de um comprador desse barco é:",
    alternativas: [
      { letra: "A", texto: "68", correta: false },
      { letra: "B", texto: "86", correta: false },
      { letra: "C", texto: "124", correta: false },
      { letra: "D", texto: "128", correta: false },
      { letra: "E", texto: "192", correta: true },
    ],
    gabarito: "E",
    resolucao: "Cor: 8. Acabamento: 4. Motor: 3. Combustível: 2. N = 8 × 4 × 3 × 2 = 192.",
    subtemaId: subPM.id,
    secao: "fixacao",
    dificuldade: "facil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Em uma festa infantil estão presentes 10 meninos usando calça de brim e 10 meninos usando calça de veludo. Quantos grupos de 5 meninos podemos formar se em cada um dos grupos deve haver 3 meninos usando calça de brim e dois meninos usando calça de veludo?",
    alternativas: [
      { letra: "A", texto: "45", correta: false },
      { letra: "B", texto: "120", correta: false },
      { letra: "C", texto: "165", correta: false },
      { letra: "D", texto: "3165", correta: false },
      { letra: "E", texto: "5400", correta: true },
    ],
    gabarito: "E",
    resolucao: "$C_{10}^3 \\times C_{10}^2 = 120 \\times 45 = 5400$.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Em uma certa comunidade, dois homens sempre se cumprimentam (na chegada) com um aperto de mão e se despedem (na saída) com outro aperto de mão. Um homem e uma mulher se cumprimentam com um aperto de mão, mas se despedem com um aceno. Duas mulheres só trocam acenos. Em uma comemoração, na qual 37 pessoas almoçaram juntas, todos se cumprimentaram e se despediram na forma descrita acima. Quantos dos presentes eram mulheres, sabendo que foram trocados 720 apertos de mão?",
    alternativas: [
      { letra: "A", texto: "16", correta: false },
      { letra: "B", texto: "17", correta: true },
      { letra: "C", texto: "18", correta: false },
      { letra: "D", texto: "19", correta: false },
      { letra: "E", texto: "20", correta: false },
    ],
    gabarito: "B",
    resolucao: "Sendo n o número de homens: apertos entre homens = n(n-1), entre homem e mulher = n(37-n). Equação: n(n-1) + n(37-n) = 720 → 36n = 720 → n = 20. Mulheres = 37 - 20 = 17.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Numa primeira fase de um campeonato de xadrez cada jogador joga uma vez contra todos os demais. Nessa fase foram realizados 78 jogos. Quantos eram os jogadores?",
    alternativas: [
      { letra: "A", texto: "10", correta: false },
      { letra: "B", texto: "11", correta: false },
      { letra: "C", texto: "12", correta: false },
      { letra: "D", texto: "13", correta: true },
      { letra: "E", texto: "14", correta: false },
    ],
    gabarito: "D",
    resolucao: "$C_n^2 = 78 \\Rightarrow \\frac{n(n-1)}{2} = 78 \\Rightarrow n^2 - n - 156 = 0 \\Rightarrow n = 13$.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Numa cidade, os números telefônicos não podem começar por zero e têm oito algarismos, dos quais os quatro primeiros constituem o prefixo. Considere que os quatro últimos dígitos de todas as farmácias são 0000 e que o prefixo da farmácia VIVAVIDA é formado pelos dígitos 2, 4, 5 e 6, não repetidos e não necessariamente nesta ordem. O número máximo de tentativas a serem feitas para identificar o número telefônico completo dessa farmácia equivale a:",
    alternativas: [
      { letra: "A", texto: "6", correta: false },
      { letra: "B", texto: "24", correta: true },
      { letra: "C", texto: "64", correta: false },
      { letra: "D", texto: "128", correta: false },
      { letra: "E", texto: "336", correta: false },
    ],
    gabarito: "B",
    resolucao: "O número de prefixos possíveis é igual ao número de ordenações dos dígitos 2, 4, 5 e 6. N = P₄ = 4! = 24.",
    subtemaId: subPerm.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Nove pessoas foram pernoitar num hotel. Existem três quartos, com três lugares cada. O número de formas que essas pessoas podem se distribuir entre os quartos é:",
    alternativas: [
      { letra: "A", texto: "81", correta: false },
      { letra: "B", texto: "128", correta: false },
      { letra: "C", texto: "840", correta: false },
      { letra: "D", texto: "1680", correta: true },
      { letra: "E", texto: "3200", correta: false },
    ],
    gabarito: "D",
    resolucao: "1º quarto: $C_9^3 = 84$. 2º quarto: $C_6^3 = 20$. 3º quarto: $C_3^3 = 1$. N = 84 × 20 × 1 = 1680.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "medio",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Considere todos os números inteiros positivos com 5 algarismos significativos distintos. Quantos desses números são múltiplos de 5 e têm a soma de seus algarismos par?",
    alternativas: [
      { letra: "A", texto: "960", correta: false },
      { letra: "B", texto: "768", correta: true },
      { letra: "C", texto: "384", correta: false },
      { letra: "D", texto: "192", correta: false },
      { letra: "E", texto: "96", correta: false },
    ],
    gabarito: "B",
    resolucao: "Múltiplo de 5 com algarismos significativos: último algarismo é 5. Soma par exige número ímpar de algarismos ímpares nos outros 4. Dois subcasos (1 ímpar + 3 pares, ou 3 ímpares + 1 par) cada com 384 números. N = 384 + 384 = 768.",
    subtemaId: subPerm.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Em quantos anagramas da palavra CORVETA não aparecem vogais juntas?",
    alternativas: [
      { letra: "A", texto: "144", correta: false },
      { letra: "B", texto: "288", correta: false },
      { letra: "C", texto: "432", correta: false },
      { letra: "D", texto: "720", correta: false },
      { letra: "E", texto: "1440", correta: true },
    ],
    gabarito: "E",
    resolucao: "Consoantes C, R, V, T: P₄ = 4! = 24 ordenações. Para cada ordem das consoantes há 5 espaços para as 3 vogais (O, E, A), sem adjacência: 5×4×3 = 60 modos. N = 24 × 60 = 1440.",
    subtemaId: subPerm.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Uma urna contém 6 bolas brancas, 6 vermelhas, 6 amarelas e 6 azuis, numeradas de 1 a 24. Sacam-se de uma vez 4 bolas. O número de extrações possíveis onde aparecem, pelo menos, 3 cores diferentes é:",
    alternativas: [
      { letra: "A", texto: "1296", correta: false },
      { letra: "B", texto: "2160", correta: false },
      { letra: "C", texto: "6480", correta: false },
      { letra: "D", texto: "7776", correta: true },
      { letra: "E", texto: "15552", correta: false },
    ],
    gabarito: "D",
    resolucao: "Com 4 cores: $6^4 = 1296$. Com exatamente 3 cores: escolha da cor repetida (4) × $C_6^2$ (bolas dessa cor) × $C_3^2$ (outras 2 cores) × $6^2$ = 4×15×3×36 = 6480. N = 1296 + 6480 = 7776.",
    subtemaId: subComb.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  await criarQuestao({
    enunciado: "Qual o valor da soma de todos os valores inteiros com 4 algarismos distintos, que podem ser escritos com os algarismos 1, 2, 3 e 4?",
    alternativas: [
      { letra: "A", texto: "10000", correta: false },
      { letra: "B", texto: "66660", correta: true },
      { letra: "C", texto: "66666", correta: false },
      { letra: "D", texto: "100000", correta: false },
      { letra: "E", texto: "160000", correta: false },
    ],
    gabarito: "B",
    resolucao: "Associando 1↔4 e 2↔3, cada número fica associado a outro de modo que a soma dos dois é 5555. Com P₄ = 4! = 24 números, formam-se 12 pares. SOMA = 12 × 5555 = 66.660.",
    subtemaId: subPerm.id,
    secao: "fixacao",
    dificuldade: "dificil",
    fonte: FONTE,
    anoFonte: ANO,
  });

  console.log("✅ Seed concluído: 50 questões de Análise Combinatória inseridas.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
