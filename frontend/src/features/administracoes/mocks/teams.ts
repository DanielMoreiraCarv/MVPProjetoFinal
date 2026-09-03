import { Team } from "@/src/lib/types/team";

const football = { id: 1, name: "Futebol" as const, description: "Futebol associação" };

const p = (id: string, name: string, number: number, age: number, suspended = false) => ({ id, name, number, age, suspended });

// ──────────────────────────────────────────────
// COMP 1 — Futebol Fundamental II Masculino
// Times 1-16 | Idades 11-15
// ──────────────────────────────────────────────

const t1: Team = { id: 1, name: "Panteras Negras", sport: football, players: [
    p("t1p1","João Victor Silva",1,13), p("t1p2","Pedro Alves",2,14), p("t1p3","Lucas Martins",3,12),
    p("t1p4","Gabriel Souza",4,13), p("t1p5","Matheus Ferreira",5,14), p("t1p6","Victor Lima",6,12),
    p("t1p7","Rafael Costa",7,13), p("t1p8","Gustavo Pereira",8,14), p("t1p9","Felipe Rodrigues",9,11),
    p("t1p10","André Nunes",10,13), p("t1p11","Bruno Gomes",11,14), p("t1p12","Leonardo Araújo",12,12),
    p("t1p13","Diego Nascimento",13,13), p("t1p14","Carlos Moreira",14,15), p("t1p15","Miguel Carvalho",15,12),
]};

const t2: Team = { id: 2, name: "Trovões Azuis", sport: football, players: [
    p("t2p1","Henrique Ribeiro",1,13), p("t2p2","Arthur Barbosa",2,14), p("t2p3","Enzo Mendes",3,12),
    p("t2p4","Thiago Dias",4,13), p("t2p5","Igor Vieira",5,14), p("t2p6","Eduardo Cardoso",6,11),
    p("t2p7","Caio Reis",7,13), p("t2p8","Natan Teixeira",8,14), p("t2p9","Davi Castro",9,12),
    p("t2p10","Samuel Campos",10,13), p("t2p11","Raul Fonseca",11,15), p("t2p12","Nicolas Macedo",12,12),
    p("t2p13","Daniel Medeiros",13,13), p("t2p14","Fábio Xavier",14,14), p("t2p15","Alan Tavares",15,11),
]};

const t3: Team = { id: 3, name: "Leões do Norte", sport: football, players: [
    p("t3p1","Renato Monteiro",1,14), p("t3p2","Leandro Freitas",2,13), p("t3p3","Tiago Luz",3,12),
    p("t3p4","Wilson Brito",4,15), p("t3p5","Wagner Duarte",5,13), p("t3p6","Willian Correia",6,14),
    p("t3p7","Edmilson Cunha",7,12), p("t3p8","Cleber Santos",8,13), p("t3p9","Nelinho Oliveira",9,11),
    p("t3p10","Juninho Souza",10,14), p("t3p11","Paulinho Lima",11,13), p("t3p12","Adriano Ferreira",12,12),
    p("t3p13","Emerson Costa",13,15), p("t3p14","Fabiano Alves",14,13), p("t3p15","Claudinho Pereira",15,14),
]};

const t4: Team = { id: 4, name: "Tubarões Furiosos", sport: football, players: [
    p("t4p1","Ricardinho Rodrigues",1,13), p("t4p2","Fernando Nunes",2,14), p("t4p3","Sandro Gomes",3,12),
    p("t4p4","Everton Araújo",4,13), p("t4p5","Alex Nascimento",5,11), p("t4p6","Danilo Moreira",6,14),
    p("t4p7","Breno Carvalho",7,13), p("t4p8","Cássio Ribeiro",8,15), p("t4p9","Murilo Barbosa",9,12),
    p("t4p10","Kaique Mendes",10,13), p("t4p11","Ruan Dias",11,14), p("t4p12","Yago Vieira",12,12),
    p("t4p13","Mateus Cardoso",13,13), p("t4p14","Vinícius Reis",14,11), p("t4p15","Gael Teixeira",15,14),
]};

const t5: Team = { id: 5, name: "Falcões Dourados", sport: football, players: [
    p("t5p1","Ian Castro",1,14), p("t5p2","Luan Campos",2,13), p("t5p3","Cauã Fonseca",3,12),
    p("t5p4","Noah Macedo",4,15), p("t5p5","Erick Medeiros",5,13), p("t5p6","Bernardo Xavier",6,14),
    p("t5p7","Lorenzo Tavares",7,12), p("t5p8","Miguel Monteiro",8,13), p("t5p9","Bento Freitas",9,11),
    p("t5p10","Theo Luz",10,14), p("t5p11","Heitor Brito",11,13), p("t5p12","Vicente Duarte",12,12),
    p("t5p13","Samuel Correia",13,15), p("t5p14","Bryan Cunha",14,13), p("t5p15","Davi Santos",15,14),
]};

const t6: Team = { id: 6, name: "Dragões de Ferro", sport: football, players: [
    p("t6p1","Kauê Oliveira",1,13), p("t6p2","Murilo Souza",2,14), p("t6p3","Tales Lima",3,12),
    p("t6p4","Átila Ferreira",4,13), p("t6p5","Renan Costa",5,11), p("t6p6","Vitor Alves",6,14),
    p("t6p7","Carlos Eduardo Pereira",7,13), p("t6p8","Marcos Rodrigues",8,15), p("t6p9","Luiz Felipe Nunes",9,12),
    p("t6p10","Paulo Henrique Gomes",10,13), p("t6p11","Gustavo Araújo",11,14), p("t6p12","Rafael Nascimento",12,12),
    p("t6p13","André Moreira",13,13), p("t6p14","Bruno Carvalho",14,11), p("t6p15","Leonardo Ribeiro",15,14),
]};

const t7: Team = { id: 7, name: "Lobos da Noite", sport: football, players: [
    p("t7p1","Diego Barbosa",1,14), p("t7p2","Carlos Mendes",2,13), p("t7p3","Miguel Dias",3,12),
    p("t7p4","Henrique Vieira",4,15), p("t7p5","Arthur Cardoso",5,13), p("t7p6","Enzo Reis",6,14),
    p("t7p7","Thiago Teixeira",7,12), p("t7p8","Igor Castro",8,13), p("t7p9","Eduardo Campos",9,11),
    p("t7p10","Caio Fonseca",10,14), p("t7p11","Natan Macedo",11,13), p("t7p12","Davi Medeiros",12,12),
    p("t7p13","Samuel Xavier",13,15), p("t7p14","Raul Tavares",14,13), p("t7p15","Nicolas Monteiro",15,14),
]};

const t8: Team = { id: 8, name: "Cobras Venenosas", sport: football, players: [
    p("t8p1","Daniel Freitas",1,13), p("t8p2","Fábio Luz",2,14), p("t8p3","Alan Brito",3,12),
    p("t8p4","Renato Duarte",4,13), p("t8p5","Leandro Correia",5,11), p("t8p6","Tiago Cunha",6,14),
    p("t8p7","Wilson Santos",7,13), p("t8p8","Wagner Oliveira",8,15), p("t8p9","Willian Souza",9,12),
    p("t8p10","Edmilson Lima",10,13), p("t8p11","Cleber Ferreira",11,14), p("t8p12","Nelinho Costa",12,12),
    p("t8p13","Juninho Alves",13,13), p("t8p14","Paulinho Pereira",14,11), p("t8p15","Adriano Rodrigues",15,14),
]};

const t9: Team = { id: 9, name: "Águias Plateadas", sport: football, players: [
    p("t9p1","Emerson Nunes",1,14), p("t9p2","Fabiano Gomes",2,13), p("t9p3","Claudinho Araújo",3,12),
    p("t9p4","Ricardinho Nascimento",4,15), p("t9p5","Fernando Moreira",5,13), p("t9p6","Sandro Carvalho",6,14),
    p("t9p7","Everton Ribeiro",7,12), p("t9p8","Alex Barbosa",8,13), p("t9p9","Danilo Mendes",9,11),
    p("t9p10","Breno Dias",10,14), p("t9p11","Cássio Vieira",11,13), p("t9p12","Murilo Cardoso",12,12),
    p("t9p13","Kaique Reis",13,15), p("t9p14","Ruan Teixeira",14,13), p("t9p15","Yago Castro",15,14),
]};

const t10: Team = { id: 10, name: "Rinocerontes Brancos", sport: football, players: [
    p("t10p1","Mateus Campos",1,13), p("t10p2","Vinícius Fonseca",2,14), p("t10p3","Gael Macedo",3,12),
    p("t10p4","Ian Medeiros",4,13), p("t10p5","Luan Xavier",5,11), p("t10p6","Cauã Tavares",6,14),
    p("t10p7","Noah Monteiro",7,13), p("t10p8","Erick Freitas",8,15), p("t10p9","Bernardo Luz",9,12),
    p("t10p10","Lorenzo Brito",10,13), p("t10p11","Bento Duarte",11,14), p("t10p12","Theo Correia",12,12),
    p("t10p13","Heitor Cunha",13,13), p("t10p14","Vicente Santos",14,11), p("t10p15","Bryan Oliveira",15,14),
]};

const t11: Team = { id: 11, name: "Tigres da Serra", sport: football, players: [
    p("t11p1","Kauê Souza",1,14), p("t11p2","Murilo Lima",2,13), p("t11p3","Tales Ferreira",3,12),
    p("t11p4","Átila Costa",4,15), p("t11p5","Renan Alves",5,13), p("t11p6","João Pedro Silva",6,14),
    p("t11p7","Pedro Lucas Rodrigues",7,12), p("t11p8","Lucas Gabriel Nunes",8,13), p("t11p9","Gabriel Matheus Gomes",9,11),
    p("t11p10","Matheus Victor Araújo",10,14), p("t11p11","Victor Rafael Nascimento",11,13), p("t11p12","Rafael Gustavo Moreira",12,12),
    p("t11p13","Gustavo Felipe Carvalho",13,15), p("t11p14","Felipe André Ribeiro",14,13), p("t11p15","André Bruno Barbosa",15,14),
]};

const t12: Team = { id: 12, name: "Ursos Polares", sport: football, players: [
    p("t12p1","Bruno Leonardo Mendes",1,13), p("t12p2","Leonardo Diego Dias",2,14), p("t12p3","Diego Carlos Vieira",3,12),
    p("t12p4","Carlos Miguel Cardoso",4,13), p("t12p5","Miguel Henrique Reis",5,11), p("t12p6","Henrique Arthur Teixeira",6,14),
    p("t12p7","Arthur Enzo Castro",7,13), p("t12p8","Enzo Thiago Campos",8,15), p("t12p9","Thiago Igor Fonseca",9,12),
    p("t12p10","Igor Eduardo Macedo",10,13), p("t12p11","Eduardo Caio Medeiros",11,14), p("t12p12","Caio Natan Xavier",12,12),
    p("t12p13","Natan Davi Tavares",13,13), p("t12p14","Davi Samuel Monteiro",14,11), p("t12p15","Samuel Raul Freitas",15,14),
]};

const t13: Team = { id: 13, name: "Javalis Selvagens", sport: football, players: [
    p("t13p1","Raul Nicolas Luz",1,14), p("t13p2","Nicolas Daniel Brito",2,13), p("t13p3","Daniel Fábio Duarte",3,12),
    p("t13p4","Fábio Alan Correia",4,15), p("t13p5","Alan Renato Cunha",5,13), p("t13p6","Renato Leandro Santos",6,14),
    p("t13p7","Leandro Tiago Oliveira",7,12), p("t13p8","Tiago Wilson Souza",8,13), p("t13p9","Wilson Wagner Lima",9,11),
    p("t13p10","Wagner Willian Ferreira",10,14), p("t13p11","Willian Edmilson Costa",11,13), p("t13p12","Edmilson Cleber Alves",12,12),
    p("t13p13","Cleber Nelinho Pereira",13,15), p("t13p14","Nelinho Juninho Rodrigues",14,13), p("t13p15","Juninho Paulinho Nunes",15,14),
]};

const t14: Team = { id: 14, name: "Gaviões do Colégio", sport: football, players: [
    p("t14p1","Adriano Emerson Gomes",1,13), p("t14p2","Emerson Fabiano Araújo",2,14), p("t14p3","Fabiano Claudinho Nascimento",3,12),
    p("t14p4","Claudinho Ricardinho Moreira",4,13), p("t14p5","Ricardinho Fernando Carvalho",5,11), p("t14p6","Fernando Sandro Ribeiro",6,14),
    p("t14p7","Sandro Everton Barbosa",7,13), p("t14p8","Everton Alex Mendes",8,15), p("t14p9","Alex Danilo Dias",9,12),
    p("t14p10","Danilo Breno Vieira",10,13), p("t14p11","Breno Cássio Cardoso",11,14), p("t14p12","Cássio Murilo Reis",12,12),
    p("t14p13","Murilo Kaique Teixeira",13,13), p("t14p14","Kaique Ruan Castro",14,11), p("t14p15","Ruan Yago Campos",15,14),
]};

const t15: Team = { id: 15, name: "Piratas do Fundamental", sport: football, players: [
    p("t15p1","Yago Mateus Fonseca",1,14), p("t15p2","Mateus Vinícius Macedo",2,13), p("t15p3","Vinícius Gael Medeiros",3,12),
    p("t15p4","Gael Ian Xavier",4,15), p("t15p5","Ian Luan Tavares",5,13), p("t15p6","Luan Cauã Monteiro",6,14),
    p("t15p7","Cauã Noah Freitas",7,12), p("t15p8","Noah Erick Luz",8,13), p("t15p9","Erick Bernardo Brito",9,11),
    p("t15p10","Bernardo Lorenzo Duarte",10,14), p("t15p11","Lorenzo Bento Correia",11,13), p("t15p12","Bento Theo Cunha",12,12),
    p("t15p13","Theo Heitor Santos",13,15), p("t15p14","Heitor Vicente Oliveira",14,13), p("t15p15","Vicente Bryan Souza",15,14),
]};

const t16: Team = { id: 16, name: "Guerreiros da Quadra", sport: football, players: [
    p("t16p1","Bryan Kauê Lima",1,13), p("t16p2","Kauê Murilo Ferreira",2,14), p("t16p3","Murilo Tales Costa",3,12),
    p("t16p4","Tales Átila Alves",4,13), p("t16p5","Átila Renan Pereira",5,11), p("t16p6","Renan Vitor Rodrigues",6,14),
    p("t16p7","Vitor Carlos Nunes",7,13), p("t16p8","Carlos Marcos Gomes",8,15), p("t16p9","Marcos Luiz Araújo",9,12),
    p("t16p10","Luiz Paulo Nascimento",10,13), p("t16p11","Paulo Pedro Moreira",11,14), p("t16p12","Pedro João Carvalho",12,12),
    p("t16p13","João Lucas Ribeiro",13,13), p("t16p14","Lucas Gabriel Barbosa",14,11), p("t16p15","Gabriel Matheus Mendes",15,14),
]};

// ──────────────────────────────────────────────
// COMP 2 — Futebol Ensino Médio Masculino
// Times 17-32 | Idades 15-18
// ──────────────────────────────────────────────

const t17: Team = { id: 17, name: "Gladiadores do EM", sport: football, players: [
    p("t17p1","Thiago Almeida",1,17), p("t17p2","Leandro Brandão",2,16), p("t17p3","Alexandre Coutinho",3,18),
    p("t17p4","Marcelo Drummond",4,17), p("t17p5","Alan Evangelista",5,16), p("t17p6","Renato Figueiredo",6,15),
    p("t17p7","Fernando Guimarães",7,17), p("t17p8","Sandro Honorato",8,18), p("t17p9","Everton Ibiapina",9,16),
    p("t17p10","Alex Justino",10,17), p("t17p11","Danilo Koslowski",11,15), p("t17p12","Breno Lacerda",12,16),
    p("t17p13","Cássio Machado",13,18), p("t17p14","Murilo Novais",14,17), p("t17p15","Kaique Olveira",15,16),
]};

const t18: Team = { id: 18, name: "Titãs da Primeira", sport: football, players: [
    p("t18p1","Ruan Palmeira",1,17), p("t18p2","Yago Queiroz",2,16), p("t18p3","Mateus Ramalho",3,18),
    p("t18p4","Vinícius Saraiva",4,17), p("t18p5","Gael Tibúrcio",5,16), p("t18p6","Ian Ulisses",6,15),
    p("t18p7","Luan Vasconcellos",7,17), p("t18p8","Cauã Wanderley",8,18), p("t18p9","Noah Xavier",9,16),
    p("t18p10","Erick Yamamoto",10,17), p("t18p11","Bernardo Zagallo",11,15), p("t18p12","Lorenzo Abrantes",12,16),
    p("t18p13","Bento Barreto",13,18), p("t18p14","Theo Calixto",14,17), p("t18p15","Heitor Delgado",15,16),
]};

const t19: Team = { id: 19, name: "Spartanos da Segunda", sport: football, players: [
    p("t19p1","Vicente Espíndola",1,17), p("t19p2","Bryan Falcão",2,16), p("t19p3","Kauê Galvão",3,18),
    p("t19p4","Tales Henriques",4,17), p("t19p5","Átila Isidoro",5,16), p("t19p6","Renan Jardim",6,15),
    p("t19p7","Vitor Krause",7,17), p("t19p8","Carlos Leitão",8,18), p("t19p9","Marcos Menezes",9,16),
    p("t19p10","Luiz Negrão",10,17), p("t19p11","Paulo Otávio",11,15), p("t19p12","Pedro Pinheiro",12,16),
    p("t19p13","João Quintela",13,18), p("t19p14","Lucas Rego",14,17), p("t19p15","Gabriel Sabino",15,16),
]};

const t20: Team = { id: 20, name: "Centuriões da Terceira", sport: football, players: [
    p("t20p1","Matheus Torres",1,17), p("t20p2","Victor Urquiza",2,16), p("t20p3","Rafael Vasconcelos",3,18),
    p("t20p4","Gustavo Weiss",4,17), p("t20p5","Felipe Albuquerque",5,16), p("t20p6","André Bezerra",6,15),
    p("t20p7","Bruno Cavalcante",7,17), p("t20p8","Leonardo Dantas",8,18), p("t20p9","Diego Esteves",9,16),
    p("t20p10","Carlos Fontes",10,17), p("t20p11","Miguel Guerreiro",11,15), p("t20p12","Henrique Ivo",12,16),
    p("t20p13","Arthur Januário",13,18), p("t20p14","Enzo Kauer",14,17), p("t20p15","Thiago Lobato",15,16),
]};

const t21: Team = { id: 21, name: "Vikingues Dourados", sport: football, players: [
    p("t21p1","Igor Maciel",1,17), p("t21p2","Eduardo Marinho",2,16), p("t21p3","Caio Neves",3,18),
    p("t21p4","Natan Octávio",4,17), p("t21p5","Davi Pacheco",5,16), p("t21p6","Samuel Quadros",6,15),
    p("t21p7","Raul Ramos",7,17), p("t21p8","Nicolas Salgado",8,18), p("t21p9","Daniel Tanaka",9,16),
    p("t21p10","Fábio Ulhoa",10,17), p("t21p11","Alan Viana",11,15), p("t21p12","Renato Werneck",12,16),
    p("t21p13","Leandro Abreu",13,18), p("t21p14","Tiago Borba",14,17), p("t21p15","Wilson Carmo",15,16),
]};

const t22: Team = { id: 22, name: "Samurais do Colégio", sport: football, players: [
    p("t22p1","Wagner Daltro",1,17), p("t22p2","Willian Enéas",2,16), p("t22p3","Edmilson Falqueto",3,18),
    p("t22p4","Cleber Germano",4,17), p("t22p5","Nelinho Herculano",5,16), p("t22p6","Juninho Imperiano",6,15),
    p("t22p7","Paulinho Jasmim",7,17), p("t22p8","Adriano Kléber",8,18), p("t22p9","Emerson Linhares",9,16),
    p("t22p10","Fabiano Matos",10,17), p("t22p11","Claudinho Neco",11,15), p("t22p12","Ricardinho Omena",12,16),
    p("t22p13","Fernando Portela",13,18), p("t22p14","Sandro Quito",14,17), p("t22p15","Everton Rattes",15,16),
]};

const t23: Team = { id: 23, name: "Ninjas da Tarde", sport: football, players: [
    p("t23p1","Alex Salomão",1,17), p("t23p2","Danilo Taveira",2,16), p("t23p3","Breno Ulisses",3,18),
    p("t23p4","Cássio Valentim",4,17), p("t23p5","Murilo Walmor",5,16), p("t23p6","Kaique Abdon",6,15),
    p("t23p7","Ruan Acácio",7,17), p("t23p8","Yago Adaílton",8,18), p("t23p9","Mateus Badu",9,16),
    p("t23p10","Vinícius Carmelo",10,17), p("t23p11","Gael Dodô",11,15), p("t23p12","Ian Ernando",12,16),
    p("t23p13","Luan Fafá",13,18), p("t23p14","Cauã Guga",14,17), p("t23p15","Noah Hulk",15,16),
]};

const t24: Team = { id: 24, name: "Guerreiros do Norte", sport: football, players: [
    p("t24p1","Erick Índio",1,17), p("t24p2","Bernardo Jô",2,16), p("t24p3","Lorenzo Kaká",3,18),
    p("t24p4","Bento Léo",4,17), p("t24p5","Theo Luizão",5,16), p("t24p6","Heitor Meia",6,15),
    p("t24p7","Vicente Mineiro",7,17), p("t24p8","Bryan Neto",8,18), p("t24p9","Kauê Nico",9,16),
    p("t24p10","Tales Pardal",10,17), p("t24p11","Átila Pipoca",11,15), p("t24p12","Renan Queca",12,16),
    p("t24p13","Vitor Ratão",13,18), p("t24p14","Carlos Saci",14,17), p("t24p15","Marcos Toco",15,16),
]};

const t25: Team = { id: 25, name: "Cavaleiros Negros", sport: football, players: [
    p("t25p1","Luiz Urubu",1,17), p("t25p2","Paulo Xerém",2,16), p("t25p3","Pedro Zé",3,18),
    p("t25p4","João Aílton",4,17), p("t25p5","Lucas Baiano",5,16), p("t25p6","Gabriel Carioca",6,15),
    p("t25p7","Matheus Dendê",7,17), p("t25p8","Victor Fio",8,18), p("t25p9","Rafael Galega",9,16),
    p("t25p10","Gustavo Gringo",10,17), p("t25p11","Felipe Jacaré",11,15), p("t25p12","André Japa",12,16),
    p("t25p13","Bruno Ladrão",13,18), p("t25p14","Leonardo Laranjinha",14,17), p("t25p15","Diego Lobão",15,16),
]};

const t26: Team = { id: 26, name: "Escudeiros da Lua", sport: football, players: [
    p("t26p1","Carlos Magrão",1,17), p("t26p2","Miguel Mendigo",2,16), p("t26p3","Henrique Mosquito",3,18),
    p("t26p4","Arthur Muié",4,17), p("t26p5","Enzo Naná",5,16), p("t26p6","Thiago Neguinho",6,15),
    p("t26p7","Igor Peba",7,17), p("t26p8","Eduardo Petisco",8,18), p("t26p9","Caio Pezão",9,16),
    p("t26p10","Natan Pikachu",10,17), p("t26p11","Davi Popó",11,15), p("t26p12","Samuel Robinho",12,16),
    p("t26p13","Raul Rôbson",13,18), p("t26p14","Nicolas Ronaldinho",14,17), p("t26p15","Daniel Sabiá",15,16),
]};

const t27: Team = { id: 27, name: "Templários da Escola", sport: football, players: [
    p("t27p1","Fábio Serginho",1,17), p("t27p2","Alan Sorriso",2,16), p("t27p3","Renato Tatu",3,18),
    p("t27p4","Leandro Tchê",4,17), p("t27p5","Tiago Tinga",5,16), p("t27p6","Wilson Tonho",6,15),
    p("t27p7","Wagner Torricelli",7,17), p("t27p8","Willian Tucano",8,18), p("t27p9","Edmilson Vampeta",9,16),
    p("t27p10","Cleber Vandinho",10,17), p("t27p11","Nelinho Venâncio",11,15), p("t27p12","Juninho Vevê",12,16),
    p("t27p13","Paulinho Vinicius",13,18), p("t27p14","Adriano Wagnão",14,17), p("t27p15","Emerson Zaga",15,16),
]};

const t28: Team = { id: 28, name: "Cruzados do Sul", sport: football, players: [
    p("t28p1","Fabiano Zeca",1,17), p("t28p2","Claudinho Abreu",2,16), p("t28p3","Ricardinho Acosta",3,18),
    p("t28p4","Fernando Aguinaldo",4,17), p("t28p5","Sandro Aldair",5,16), p("t28p6","Everton Aleixo",6,15),
    p("t28p7","Alex Alencar",7,17), p("t28p8","Danilo Alexsandro",8,18), p("t28p9","Breno Almir",9,16),
    p("t28p10","Cássio Almirante",10,17), p("t28p11","Murilo Altemir",11,15), p("t28p12","Kaique Aluno",12,16),
    p("t28p13","Ruan Amaro",13,18), p("t28p14","Yago Amarildo",14,17), p("t28p15","Mateus Amigos",15,16),
]};

const t29: Team = { id: 29, name: "Espartanos da Tarde", sport: football, players: [
    p("t29p1","Vinícius Ancheta",1,17), p("t29p2","Gael Andorinha",2,16), p("t29p3","Ian Angélico",3,18),
    p("t29p4","Luan Antenor",4,17), p("t29p5","Cauã Antero",5,16), p("t29p6","Noah Antônio",6,15),
    p("t29p7","Erick Aparício",7,17), p("t29p8","Bernardo Apolo",8,18), p("t29p9","Lorenzo Aquino",9,16),
    p("t29p10","Bento Araquém",10,17), p("t29p11","Theo Aristeu",11,15), p("t29p12","Heitor Arnaldo",12,16),
    p("t29p13","Vicente Aroldo",13,18), p("t29p14","Bryan Artur",14,17), p("t29p15","Kauê Arvid",15,16),
]};

const t30: Team = { id: 30, name: "Romanos da Segunda", sport: football, players: [
    p("t30p1","Tales Asdrúbal",1,17), p("t30p2","Átila Assunção",2,16), p("t30p3","Renan Ataide",3,18),
    p("t30p4","Vitor Athos",4,17), p("t30p5","Carlos Augusto",5,16), p("t30p6","Marcos Aurélio",6,15),
    p("t30p7","Luiz Avelino",7,17), p("t30p8","Paulo Avner",8,18), p("t30p9","Pedro Axel",9,16),
    p("t30p10","João Ayres",10,17), p("t30p11","Lucas Azael",11,15), p("t30p12","Gabriel Azário",12,16),
    p("t30p13","Matheus Azevedo",13,18), p("t30p14","Victor Aziz",14,17), p("t30p15","Rafael Azor",15,16),
]};

const t31: Team = { id: 31, name: "Nórdicos do EM", sport: football, players: [
    p("t31p1","Gustavo Bacelar",1,17), p("t31p2","Felipe Bachega",2,16), p("t31p3","André Bagnato",3,18),
    p("t31p4","Bruno Baiano",4,17), p("t31p5","Leonardo Bairro",5,16), p("t31p6","Diego Balaguer",6,15),
    p("t31p7","Carlos Baldo",7,17), p("t31p8","Miguel Baldoíno",8,18), p("t31p9","Henrique Balthazar",9,16),
    p("t31p10","Arthur Bamberg",10,17), p("t31p11","Enzo Bandeira",11,15), p("t31p12","Thiago Baniwa",12,16),
    p("t31p13","Igor Baptista",13,18), p("t31p14","Eduardo Baracho",14,17), p("t31p15","Caio Barbalho",15,16),
]};

const t32: Team = { id: 32, name: "Maias da Escola", sport: football, players: [
    p("t32p1","Natan Barberino",1,17), p("t32p2","Davi Barbieri",2,16), p("t32p3","Samuel Bareiro",3,18),
    p("t32p4","Raul Baroni",4,17), p("t32p5","Nicolas Barrada",5,16), p("t32p6","Daniel Barreira",6,15),
    p("t32p7","Fábio Barros",7,17), p("t32p8","Alan Barrozo",8,18), p("t32p9","Renato Barrueto",9,16),
    p("t32p10","Leandro Bartolomeu",10,17), p("t32p11","Tiago Basílio",11,15), p("t32p12","Wilson Bastos",12,16),
    p("t32p13","Wagner Batata",13,18), p("t32p14","Willian Batinga",14,17), p("t32p15","Edmilson Bauer",15,16),
]};

// ──────────────────────────────────────────────
// COMP 3 — Futebol Fundamental II Feminino
// Times 33-48 | Idades 11-15
// ──────────────────────────────────────────────

const t33: Team = { id: 33, name: "Flamingos Rosas", sport: football, players: [
    p("t33p1","Ana Beatriz Silva",1,13), p("t33p2","Maria Clara Santos",2,14), p("t33p3","Julia Oliveira",3,12),
    p("t33p4","Isabela Souza",4,13), p("t33p5","Fernanda Lima",5,14), p("t33p6","Beatriz Ferreira",6,11),
    p("t33p7","Carolina Costa",7,13), p("t33p8","Amanda Alves",8,14), p("t33p9","Larissa Pereira",9,12),
    p("t33p10","Gabriela Rodrigues",10,13), p("t33p11","Camila Martins",11,15), p("t33p12","Letícia Nunes",12,12),
    p("t33p13","Laura Gomes",13,13), p("t33p14","Mariana Araújo",14,14), p("t33p15","Sofia Nascimento",15,11),
]};

const t34: Team = { id: 34, name: "Borboletas Douradas", sport: football, players: [
    p("t34p1","Valentina Moreira",1,13), p("t34p2","Natália Carvalho",2,14), p("t34p3","Patrícia Ribeiro",3,12),
    p("t34p4","Bianca Barbosa",4,13), p("t34p5","Renata Mendes",5,11), p("t34p6","Vitória Dias",6,14),
    p("t34p7","Aline Vieira",7,13), p("t34p8","Luana Cardoso",8,15), p("t34p9","Rafaela Reis",9,12),
    p("t34p10","Carine Teixeira",10,13), p("t34p11","Pamela Castro",11,14), p("t34p12","Taís Campos",12,12),
    p("t34p13","Lívia Fonseca",13,13), p("t34p14","Nathalia Macedo",14,11), p("t34p15","Giovana Medeiros",15,14),
]};

const t35: Team = { id: 35, name: "Onças Pintadas", sport: football, players: [
    p("t35p1","Débora Xavier",1,14), p("t35p2","Ana Luíza Tavares",2,13), p("t35p3","Maria Fernanda Monteiro",3,12),
    p("t35p4","Julia Gabriela Freitas",4,15), p("t35p5","Isabela Carolina Luz",5,13), p("t35p6","Fernanda Beatriz Brito",6,14),
    p("t35p7","Beatriz Amanda Duarte",7,12), p("t35p8","Carolina Larissa Correia",8,13), p("t35p9","Amanda Camila Cunha",9,11),
    p("t35p10","Larissa Letícia Santos",10,14), p("t35p11","Gabriela Laura Oliveira",11,13), p("t35p12","Camila Mariana Souza",12,12),
    p("t35p13","Letícia Sofia Lima",13,15), p("t35p14","Laura Valentina Ferreira",14,13), p("t35p15","Mariana Natália Costa",15,14),
]};

const t36: Team = { id: 36, name: "Pumas da Tarde", sport: football, players: [
    p("t36p1","Sofia Patrícia Alves",1,13), p("t36p2","Valentina Bianca Pereira",2,14), p("t36p3","Natália Renata Rodrigues",3,12),
    p("t36p4","Patrícia Vitória Martins",4,13), p("t36p5","Bianca Aline Nunes",5,11), p("t36p6","Renata Luana Gomes",6,14),
    p("t36p7","Vitória Rafaela Araújo",7,13), p("t36p8","Aline Carine Nascimento",8,15), p("t36p9","Luana Pamela Moreira",9,12),
    p("t36p10","Rafaela Taís Carvalho",10,13), p("t36p11","Carine Lívia Ribeiro",11,14), p("t36p12","Pamela Nathalia Barbosa",12,12),
    p("t36p13","Taís Giovana Mendes",13,13), p("t36p14","Lívia Débora Dias",14,11), p("t36p15","Nathalia Ana Vieira",15,14),
]};

const t37: Team = { id: 37, name: "Garotas de Fogo", sport: football, players: [
    p("t37p1","Giovana Maria Cardoso",1,14), p("t37p2","Débora Julia Reis",2,13), p("t37p3","Ana Luíza Teixeira",3,12),
    p("t37p4","Maria Clara Castro",4,15), p("t37p5","Julia Fernanda Campos",5,13), p("t37p6","Isabela Carolina Fonseca",6,14),
    p("t37p7","Fernanda Beatriz Macedo",7,12), p("t37p8","Beatriz Amanda Medeiros",8,13), p("t37p9","Carolina Larissa Xavier",9,11),
    p("t37p10","Amanda Camila Tavares",10,14), p("t37p11","Larissa Letícia Monteiro",11,13), p("t37p12","Gabriela Laura Freitas",12,12),
    p("t37p13","Camila Mariana Luz",13,15), p("t37p14","Letícia Sofia Brito",14,13), p("t37p15","Laura Valentina Duarte",15,14),
]};

const t38: Team = { id: 38, name: "Estrelas da Quadra", sport: football, players: [
    p("t38p1","Mariana Natália Correia",1,13), p("t38p2","Sofia Patrícia Cunha",2,14), p("t38p3","Valentina Bianca Santos",3,12),
    p("t38p4","Natália Renata Oliveira",4,13), p("t38p5","Patrícia Vitória Souza",5,11), p("t38p6","Bianca Aline Lima",6,14),
    p("t38p7","Renata Luana Ferreira",7,13), p("t38p8","Vitória Rafaela Costa",8,15), p("t38p9","Aline Carine Alves",9,12),
    p("t38p10","Luana Pamela Pereira",10,13), p("t38p11","Rafaela Taís Rodrigues",11,14), p("t38p12","Carine Lívia Martins",12,12),
    p("t38p13","Pamela Nathalia Nunes",13,13), p("t38p14","Taís Giovana Gomes",14,11), p("t38p15","Lívia Débora Araújo",15,14),
]};

const t39: Team = { id: 39, name: "Princesas do Gol", sport: football, players: [
    p("t39p1","Nathalia Ana Nascimento",1,14), p("t39p2","Giovana Maria Moreira",2,13), p("t39p3","Débora Julia Carvalho",3,12),
    p("t39p4","Ana Luíza Ribeiro",4,15), p("t39p5","Maria Clara Barbosa",5,13), p("t39p6","Julia Fernanda Mendes",6,14),
    p("t39p7","Isabela Carolina Dias",7,12), p("t39p8","Fernanda Beatriz Vieira",8,13), p("t39p9","Beatriz Amanda Cardoso",9,11),
    p("t39p10","Carolina Larissa Reis",10,14), p("t39p11","Amanda Camila Teixeira",11,13), p("t39p12","Larissa Letícia Castro",12,12),
    p("t39p13","Gabriela Laura Campos",13,15), p("t39p14","Camila Mariana Fonseca",14,13), p("t39p15","Letícia Sofia Macedo",15,14),
]};

const t40: Team = { id: 40, name: "Rainhas do Campo", sport: football, players: [
    p("t40p1","Laura Valentina Medeiros",1,13), p("t40p2","Mariana Natália Xavier",2,14), p("t40p3","Sofia Patrícia Tavares",3,12),
    p("t40p4","Valentina Bianca Monteiro",4,13), p("t40p5","Natália Renata Freitas",5,11), p("t40p6","Patrícia Vitória Luz",6,14),
    p("t40p7","Bianca Aline Brito",7,13), p("t40p8","Renata Luana Duarte",8,15), p("t40p9","Vitória Rafaela Correia",9,12),
    p("t40p10","Aline Carine Cunha",10,13), p("t40p11","Luana Pamela Santos",11,14), p("t40p12","Rafaela Taís Oliveira",12,12),
    p("t40p13","Carine Lívia Souza",13,13), p("t40p14","Pamela Nathalia Lima",14,11), p("t40p15","Taís Giovana Ferreira",15,14),
]};

const t41: Team = { id: 41, name: "Feras da Sétima", sport: football, players: [
    p("t41p1","Lívia Débora Costa",1,14), p("t41p2","Nathalia Ana Alves",2,13), p("t41p3","Giovana Maria Pereira",3,12),
    p("t41p4","Débora Julia Rodrigues",4,15), p("t41p5","Ana Luíza Martins",5,13), p("t41p6","Maria Clara Nunes",6,14),
    p("t41p7","Julia Fernanda Gomes",7,12), p("t41p8","Isabela Carolina Araújo",8,13), p("t41p9","Fernanda Beatriz Nascimento",9,11),
    p("t41p10","Beatriz Amanda Moreira",10,14), p("t41p11","Carolina Larissa Carvalho",11,13), p("t41p12","Amanda Camila Ribeiro",12,12),
    p("t41p13","Larissa Letícia Barbosa",13,15), p("t41p14","Gabriela Laura Mendes",14,13), p("t41p15","Camila Mariana Dias",15,14),
]};

const t42: Team = { id: 42, name: "Panteras Rosadas", sport: football, players: [
    p("t42p1","Letícia Sofia Vieira",1,13), p("t42p2","Laura Valentina Cardoso",2,14), p("t42p3","Mariana Natália Reis",3,12),
    p("t42p4","Sofia Patrícia Teixeira",4,13), p("t42p5","Valentina Bianca Castro",5,11), p("t42p6","Natália Renata Campos",6,14),
    p("t42p7","Patrícia Vitória Fonseca",7,13), p("t42p8","Bianca Aline Macedo",8,15), p("t42p9","Renata Luana Medeiros",9,12),
    p("t42p10","Vitória Rafaela Xavier",10,13), p("t42p11","Aline Carine Tavares",11,14), p("t42p12","Luana Pamela Monteiro",12,12),
    p("t42p13","Rafaela Taís Freitas",13,13), p("t42p14","Carine Lívia Luz",14,11), p("t42p15","Pamela Nathalia Brito",15,14),
]};

const t43: Team = { id: 43, name: "Leonas Bravias", sport: football, players: [
    p("t43p1","Taís Giovana Duarte",1,14), p("t43p2","Lívia Débora Correia",2,13), p("t43p3","Nathalia Ana Cunha",3,12),
    p("t43p4","Giovana Maria Santos",4,15), p("t43p5","Débora Julia Oliveira",5,13), p("t43p6","Ana Luíza Souza",6,14),
    p("t43p7","Maria Clara Lima",7,12), p("t43p8","Julia Fernanda Ferreira",8,13), p("t43p9","Isabela Carolina Costa",9,11),
    p("t43p10","Fernanda Beatriz Alves",10,14), p("t43p11","Beatriz Amanda Pereira",11,13), p("t43p12","Carolina Larissa Rodrigues",12,12),
    p("t43p13","Amanda Camila Martins",13,15), p("t43p14","Larissa Letícia Nunes",14,13), p("t43p15","Gabriela Laura Gomes",15,14),
]};

const t44: Team = { id: 44, name: "Tigresas do Norte", sport: football, players: [
    p("t44p1","Camila Mariana Araújo",1,13), p("t44p2","Letícia Sofia Nascimento",2,14), p("t44p3","Laura Valentina Moreira",3,12),
    p("t44p4","Mariana Natália Carvalho",4,13), p("t44p5","Sofia Patrícia Ribeiro",5,11), p("t44p6","Valentina Bianca Barbosa",6,14),
    p("t44p7","Natália Renata Mendes",7,13), p("t44p8","Patrícia Vitória Dias",8,15), p("t44p9","Bianca Aline Vieira",9,12),
    p("t44p10","Renata Luana Cardoso",10,13), p("t44p11","Vitória Rafaela Reis",11,14), p("t44p12","Aline Carine Teixeira",12,12),
    p("t44p13","Luana Pamela Castro",13,13), p("t44p14","Rafaela Taís Campos",14,11), p("t44p15","Carine Lívia Fonseca",15,14),
]};

const t45: Team = { id: 45, name: "Sereias do Gol", sport: football, players: [
    p("t45p1","Pamela Nathalia Macedo",1,14), p("t45p2","Taís Giovana Medeiros",2,13), p("t45p3","Lívia Débora Xavier",3,12),
    p("t45p4","Nathalia Ana Tavares",4,15), p("t45p5","Giovana Maria Monteiro",5,13), p("t45p6","Débora Julia Freitas",6,14),
    p("t45p7","Ana Luíza Luz",7,12), p("t45p8","Maria Clara Brito",8,13), p("t45p9","Julia Fernanda Duarte",9,11),
    p("t45p10","Isabela Carolina Correia",10,14), p("t45p11","Fernanda Beatriz Cunha",11,13), p("t45p12","Beatriz Amanda Santos",12,12),
    p("t45p13","Carolina Larissa Oliveira",13,15), p("t45p14","Amanda Camila Souza",14,13), p("t45p15","Larissa Letícia Lima",15,14),
]};

const t46: Team = { id: 46, name: "Guerreiras da Quadra", sport: football, players: [
    p("t46p1","Gabriela Laura Ferreira",1,13), p("t46p2","Camila Mariana Costa",2,14), p("t46p3","Letícia Sofia Alves",3,12),
    p("t46p4","Laura Valentina Pereira",4,13), p("t46p5","Mariana Natália Rodrigues",5,11), p("t46p6","Sofia Patrícia Martins",6,14),
    p("t46p7","Valentina Bianca Nunes",7,13), p("t46p8","Natália Renata Gomes",8,15), p("t46p9","Patrícia Vitória Araújo",9,12),
    p("t46p10","Bianca Aline Nascimento",10,13), p("t46p11","Renata Luana Moreira",11,14), p("t46p12","Vitória Rafaela Carvalho",12,12),
    p("t46p13","Aline Carine Ribeiro",13,13), p("t46p14","Luana Pamela Barbosa",14,11), p("t46p15","Rafaela Taís Mendes",15,14),
]};

const t47: Team = { id: 47, name: "Lobas da Floresta", sport: football, players: [
    p("t47p1","Carine Lívia Dias",1,14), p("t47p2","Pamela Nathalia Vieira",2,13), p("t47p3","Taís Giovana Cardoso",3,12),
    p("t47p4","Lívia Débora Reis",4,15), p("t47p5","Nathalia Ana Teixeira",5,13), p("t47p6","Giovana Maria Castro",6,14),
    p("t47p7","Débora Julia Campos",7,12), p("t47p8","Ana Luíza Fonseca",8,13), p("t47p9","Maria Clara Macedo",9,11),
    p("t47p10","Julia Fernanda Medeiros",10,14), p("t47p11","Isabela Carolina Xavier",11,13), p("t47p12","Fernanda Beatriz Tavares",12,12),
    p("t47p13","Beatriz Amanda Monteiro",13,15), p("t47p14","Carolina Larissa Freitas",14,13), p("t47p15","Amanda Camila Luz",15,14),
]};

const t48: Team = { id: 48, name: "Fênix do Colégio", sport: football, players: [
    p("t48p1","Larissa Letícia Brito",1,13), p("t48p2","Gabriela Laura Duarte",2,14), p("t48p3","Camila Mariana Correia",3,12),
    p("t48p4","Letícia Sofia Cunha",4,13), p("t48p5","Laura Valentina Santos",5,11), p("t48p6","Mariana Natália Oliveira",6,14),
    p("t48p7","Sofia Patrícia Souza",7,13), p("t48p8","Valentina Bianca Lima",8,15), p("t48p9","Natália Renata Ferreira",9,12),
    p("t48p10","Patrícia Vitória Costa",10,13), p("t48p11","Bianca Aline Alves",11,14), p("t48p12","Renata Luana Pereira",12,12),
    p("t48p13","Vitória Rafaela Rodrigues",13,13), p("t48p14","Aline Carine Martins",14,11), p("t48p15","Luana Pamela Nunes",15,14),
]};

// ──────────────────────────────────────────────
// COMP 4 — Futebol Ensino Médio Feminino
// Times 49-64 | Idades 15-18
// ──────────────────────────────────────────────

const t49: Team = { id: 49, name: "Deusas do Olimpo", sport: football, players: [
    p("t49p1","Ana Carolina Almeida",1,17), p("t49p2","Maria Eduarda Brandão",2,16), p("t49p3","Julia Coutinho",3,18),
    p("t49p4","Isabela Drummond",4,17), p("t49p5","Fernanda Evangelista",5,16), p("t49p6","Beatriz Figueiredo",6,15),
    p("t49p7","Carolina Guimarães",7,17), p("t49p8","Amanda Honorato",8,18), p("t49p9","Larissa Ibiapina",9,16),
    p("t49p10","Gabriela Justino",10,17), p("t49p11","Camila Koslowski",11,15), p("t49p12","Letícia Lacerda",12,16),
    p("t49p13","Laura Machado",13,18), p("t49p14","Mariana Novais",14,17), p("t49p15","Sofia Palmeira",15,16),
]};

const t50: Team = { id: 50, name: "Amazonas Douradas", sport: football, players: [
    p("t50p1","Valentina Queiroz",1,17), p("t50p2","Natália Ramalho",2,16), p("t50p3","Patrícia Saraiva",3,18),
    p("t50p4","Bianca Tibúrcio",4,17), p("t50p5","Renata Ulisses",5,16), p("t50p6","Vitória Vasconcellos",6,15),
    p("t50p7","Aline Wanderley",7,17), p("t50p8","Luana Xavier",8,18), p("t50p9","Rafaela Yamamoto",9,16),
    p("t50p10","Carine Zagallo",10,17), p("t50p11","Pamela Abrantes",11,15), p("t50p12","Taís Barreto",12,16),
    p("t50p13","Lívia Calixto",13,18), p("t50p14","Nathalia Delgado",14,17), p("t50p15","Giovana Espíndola",15,16),
]};

const t51: Team = { id: 51, name: "Valquírias da Escola", sport: football, players: [
    p("t51p1","Débora Falcão",1,17), p("t51p2","Ana Luíza Galvão",2,16), p("t51p3","Maria Clara Henriques",3,18),
    p("t51p4","Julia Gabriela Isidoro",4,17), p("t51p5","Isabela Carolina Jardim",5,16), p("t51p6","Fernanda Beatriz Krause",6,15),
    p("t51p7","Beatriz Amanda Leitão",7,17), p("t51p8","Carolina Larissa Menezes",8,18), p("t51p9","Amanda Camila Negrão",9,16),
    p("t51p10","Larissa Letícia Otávio",10,17), p("t51p11","Gabriela Laura Pinheiro",11,15), p("t51p12","Camila Mariana Quintela",12,16),
    p("t51p13","Letícia Sofia Rego",13,18), p("t51p14","Laura Valentina Sabino",14,17), p("t51p15","Mariana Natália Torres",15,16),
]};

const t52: Team = { id: 52, name: "Fadas da Bola", sport: football, players: [
    p("t52p1","Sofia Patrícia Urquiza",1,17), p("t52p2","Valentina Bianca Vasconcelos",2,16), p("t52p3","Natália Renata Weiss",3,18),
    p("t52p4","Patrícia Vitória Albuquerque",4,17), p("t52p5","Bianca Aline Bezerra",5,16), p("t52p6","Renata Luana Cavalcante",6,15),
    p("t52p7","Vitória Rafaela Dantas",7,17), p("t52p8","Aline Carine Esteves",8,18), p("t52p9","Luana Pamela Fontes",9,16),
    p("t52p10","Rafaela Taís Guerreiro",10,17), p("t52p11","Carine Lívia Ivo",11,15), p("t52p12","Pamela Nathalia Januário",12,16),
    p("t52p13","Taís Giovana Kauer",13,18), p("t52p14","Lívia Débora Lobato",14,17), p("t52p15","Nathalia Ana Maciel",15,16),
]};

const t53: Team = { id: 53, name: "Musas do Gol", sport: football, players: [
    p("t53p1","Giovana Maria Marinho",1,17), p("t53p2","Débora Julia Neves",2,16), p("t53p3","Ana Luíza Octávio",3,18),
    p("t53p4","Maria Clara Pacheco",4,17), p("t53p5","Julia Fernanda Quadros",5,16), p("t53p6","Isabela Carolina Ramos",6,15),
    p("t53p7","Fernanda Beatriz Salgado",7,17), p("t53p8","Beatriz Amanda Tanaka",8,18), p("t53p9","Carolina Larissa Ulhoa",9,16),
    p("t53p10","Amanda Camila Viana",10,17), p("t53p11","Larissa Letícia Werneck",11,15), p("t53p12","Gabriela Laura Abreu",12,16),
    p("t53p13","Camila Mariana Borba",13,18), p("t53p14","Letícia Sofia Carmo",14,17), p("t53p15","Laura Valentina Daltro",15,16),
]};

const t54: Team = { id: 54, name: "Lendas do Ensino Médio", sport: football, players: [
    p("t54p1","Mariana Natália Enéas",1,17), p("t54p2","Sofia Patrícia Falqueto",2,16), p("t54p3","Valentina Bianca Germano",3,18),
    p("t54p4","Natália Renata Herculano",4,17), p("t54p5","Patrícia Vitória Imperiano",5,16), p("t54p6","Bianca Aline Jasmim",6,15),
    p("t54p7","Renata Luana Kléber",7,17), p("t54p8","Vitória Rafaela Linhares",8,18), p("t54p9","Aline Carine Matos",9,16),
    p("t54p10","Luana Pamela Neco",10,17), p("t54p11","Rafaela Taís Omena",11,15), p("t54p12","Carine Lívia Portela",12,16),
    p("t54p13","Pamela Nathalia Quito",13,18), p("t54p14","Taís Giovana Rattes",14,17), p("t54p15","Lívia Débora Salomão",15,16),
]};

const t55: Team = { id: 55, name: "Harpias Prateadas", sport: football, players: [
    p("t55p1","Nathalia Ana Taveira",1,17), p("t55p2","Giovana Maria Ulisses",2,16), p("t55p3","Débora Julia Valentim",3,18),
    p("t55p4","Ana Luíza Walmor",4,17), p("t55p5","Maria Clara Abdon",5,16), p("t55p6","Julia Fernanda Acácio",6,15),
    p("t55p7","Isabela Carolina Adaílton",7,17), p("t55p8","Fernanda Beatriz Badu",8,18), p("t55p9","Beatriz Amanda Carmelo",9,16),
    p("t55p10","Carolina Larissa Dodô",10,17), p("t55p11","Amanda Camila Ernando",11,15), p("t55p12","Larissa Letícia Fafá",12,16),
    p("t55p13","Gabriela Laura Guga",13,18), p("t55p14","Camila Mariana Hulk",14,17), p("t55p15","Letícia Sofia Índia",15,16),
]};

const t56: Team = { id: 56, name: "Atletas de Ouro", sport: football, players: [
    p("t56p1","Laura Valentina Jô",1,17), p("t56p2","Mariana Natália Kaká",2,16), p("t56p3","Sofia Patrícia Léa",3,18),
    p("t56p4","Valentina Bianca Luizete",4,17), p("t56p5","Natália Renata Meia",5,16), p("t56p6","Patrícia Vitória Mineira",6,15),
    p("t56p7","Bianca Aline Neta",7,17), p("t56p8","Renata Luana Nica",8,18), p("t56p9","Vitória Rafaela Pardal",9,16),
    p("t56p10","Aline Carine Pipoca",10,17), p("t56p11","Luana Pamela Queque",11,15), p("t56p12","Rafaela Taís Ratinha",12,16),
    p("t56p13","Carine Lívia Saci",13,18), p("t56p14","Pamela Nathalia Toco",14,17), p("t56p15","Taís Giovana Urubu",15,16),
]};

const t57: Team = { id: 57, name: "Gladiadoras da Tarde", sport: football, players: [
    p("t57p1","Lívia Débora Xerém",1,17), p("t57p2","Nathalia Ana Zezé",2,16), p("t57p3","Giovana Maria Aílton",3,18),
    p("t57p4","Débora Julia Baiana",4,17), p("t57p5","Ana Luíza Carioca",5,16), p("t57p6","Maria Clara Dendê",6,15),
    p("t57p7","Julia Fernanda Fio",7,17), p("t57p8","Isabela Carolina Galega",8,18), p("t57p9","Fernanda Beatriz Gringa",9,16),
    p("t57p10","Beatriz Amanda Jacaré",10,17), p("t57p11","Carolina Larissa Japa",11,15), p("t57p12","Amanda Camila Ladrã",12,16),
    p("t57p13","Larissa Letícia Laranjinha",13,18), p("t57p14","Gabriela Laura Lobã",14,17), p("t57p15","Camila Mariana Magrã",15,16),
]};

const t58: Team = { id: 58, name: "Esfinges da Escola", sport: football, players: [
    p("t58p1","Letícia Sofia Mendiga",1,17), p("t58p2","Laura Valentina Mosquita",2,16), p("t58p3","Mariana Natália Muié",3,18),
    p("t58p4","Sofia Patrícia Naná",4,17), p("t58p5","Valentina Bianca Neguinha",5,16), p("t58p6","Natália Renata Peba",6,15),
    p("t58p7","Patrícia Vitória Petisca",7,17), p("t58p8","Bianca Aline Pezete",8,18), p("t58p9","Renata Luana Pikacha",9,16),
    p("t58p10","Vitória Rafaela Popó",10,17), p("t58p11","Aline Carine Robinha",11,15), p("t58p12","Luana Pamela Rôbsona",12,16),
    p("t58p13","Rafaela Taís Ronaldinha",13,18), p("t58p14","Carine Lívia Sabiá",14,17), p("t58p15","Pamela Nathalia Serginha",15,16),
]};

const t59: Team = { id: 59, name: "Ninfas do Campo", sport: football, players: [
    p("t59p1","Taís Giovana Sorrisa",1,17), p("t59p2","Lívia Débora Tatua",2,16), p("t59p3","Nathalia Ana Tchê",3,18),
    p("t59p4","Giovana Maria Tinga",4,17), p("t59p5","Débora Julia Tonha",5,16), p("t59p6","Ana Luíza Tucana",6,15),
    p("t59p7","Maria Clara Vampeta",7,17), p("t59p8","Julia Fernanda Vandinha",8,18), p("t59p9","Isabela Carolina Venância",9,16),
    p("t59p10","Fernanda Beatriz Vevê",10,17), p("t59p11","Beatriz Amanda Vinícia",11,15), p("t59p12","Carolina Larissa Wagnã",12,16),
    p("t59p13","Amanda Camila Zaga",13,18), p("t59p14","Larissa Letícia Zeca",14,17), p("t59p15","Gabriela Laura Zuza",15,16),
]};

const t60: Team = { id: 60, name: "Titãs da Terceira", sport: football, players: [
    p("t60p1","Camila Mariana Abreu",1,17), p("t60p2","Letícia Sofia Acosta",2,16), p("t60p3","Laura Valentina Aguinaldo",3,18),
    p("t60p4","Mariana Natália Aldair",4,17), p("t60p5","Sofia Patrícia Aleixo",5,16), p("t60p6","Valentina Bianca Alencar",6,15),
    p("t60p7","Natália Renata Alexsandra",7,17), p("t60p8","Patrícia Vitória Almira",8,18), p("t60p9","Bianca Aline Altemir",9,16),
    p("t60p10","Renata Luana Amara",10,17), p("t60p11","Vitória Rafaela Amarilde",11,15), p("t60p12","Aline Carine Ancora",12,16),
    p("t60p13","Luana Pamela Andorinha",13,18), p("t60p14","Rafaela Taís Angélica",14,17), p("t60p15","Carine Lívia Antunes",15,16),
]};

const t61: Team = { id: 61, name: "Arianas do Colégio", sport: football, players: [
    p("t61p1","Pamela Nathalia Aparícia",1,17), p("t61p2","Taís Giovana Apolo",2,16), p("t61p3","Lívia Débora Aquina",3,18),
    p("t61p4","Nathalia Ana Araquém",4,17), p("t61p5","Giovana Maria Aristéia",5,16), p("t61p6","Débora Julia Arnalda",6,15),
    p("t61p7","Ana Luíza Arolda",7,17), p("t61p8","Maria Clara Artura",8,18), p("t61p9","Julia Fernanda Arvid",9,16),
    p("t61p10","Isabela Carolina Asdrúbal",10,17), p("t61p11","Fernanda Beatriz Assunção",11,15), p("t61p12","Beatriz Amanda Ataíde",12,16),
    p("t61p13","Carolina Larissa Athos",13,18), p("t61p14","Amanda Camila Augusta",14,17), p("t61p15","Larissa Letícia Aurélia",15,16),
]};

const t62: Team = { id: 62, name: "Dominantes da Segunda", sport: football, players: [
    p("t62p1","Gabriela Laura Avelina",1,17), p("t62p2","Camila Mariana Avner",2,16), p("t62p3","Letícia Sofia Axela",3,18),
    p("t62p4","Laura Valentina Ayres",4,17), p("t62p5","Mariana Natália Azaélia",5,16), p("t62p6","Sofia Patrícia Azário",6,15),
    p("t62p7","Valentina Bianca Azevedo",7,17), p("t62p8","Natália Renata Aziz",8,18), p("t62p9","Patrícia Vitória Bacelar",9,16),
    p("t62p10","Bianca Aline Bachega",10,17), p("t62p11","Renata Luana Bagnata",11,15), p("t62p12","Vitória Rafaela Baiana",12,16),
    p("t62p13","Aline Carine Bairro",13,18), p("t62p14","Luana Pamela Balaguer",14,17), p("t62p15","Rafaela Taís Balda",15,16),
]};

const t63: Team = { id: 63, name: "Estrelas da Primeira", sport: football, players: [
    p("t63p1","Carine Lívia Baldoína",1,17), p("t63p2","Pamela Nathalia Balthazar",2,16), p("t63p3","Taís Giovana Bamberg",3,18),
    p("t63p4","Lívia Débora Bandeira",4,17), p("t63p5","Nathalia Ana Baniwa",5,16), p("t63p6","Giovana Maria Baptista",6,15),
    p("t63p7","Débora Julia Baracho",7,17), p("t63p8","Ana Luíza Barbalho",8,18), p("t63p9","Maria Clara Barberino",9,16),
    p("t63p10","Julia Fernanda Barbieri",10,17), p("t63p11","Isabela Carolina Bareiro",11,15), p("t63p12","Fernanda Beatriz Baroni",12,16),
    p("t63p13","Beatriz Amanda Barrada",13,18), p("t63p14","Carolina Larissa Barreira",14,17), p("t63p15","Amanda Camila Barros",15,16),
]};

const t64: Team = { id: 64, name: "Campeãs do Sul", sport: football, players: [
    p("t64p1","Larissa Letícia Barrozo",1,17), p("t64p2","Gabriela Laura Barrueto",2,16), p("t64p3","Camila Mariana Bartolomeu",3,18),
    p("t64p4","Letícia Sofia Basílio",4,17), p("t64p5","Laura Valentina Bastos",5,16), p("t64p6","Mariana Natália Batata",6,15),
    p("t64p7","Sofia Patrícia Batinga",7,17), p("t64p8","Valentina Bianca Bauer",8,18), p("t64p9","Natália Renata Belmiro",9,16),
    p("t64p10","Patrícia Vitória Beltrão",10,17), p("t64p11","Bianca Aline Benedita",11,15), p("t64p12","Renata Luana Bentes",12,16),
    p("t64p13","Vitória Rafaela Bessa",13,18), p("t64p14","Aline Carine Betânia",14,17), p("t64p15","Luana Pamela Bicalho",15,16),
]};

// ──────────────────────────────────────────────
// COMP 5 — Futebol Sênior 50+ Masculino
// Times 65-80 | Idades 50-62
// ──────────────────────────────────────────────

const t65: Team = { id: 65, name: "Veteranos de Ferro", sport: football, players: [
    p("t65p1","José Albuquerque",1,58), p("t65p2","Antônio Bezerra",2,55), p("t65p3","Francisco Cavalcante",3,60),
    p("t65p4","João Dantas",4,52), p("t65p5","Carlos Esteves",5,57), p("t65p6","Luiz Fontes",6,54),
    p("t65p7","Paulo Guerreiro",7,61), p("t65p8","Pedro Ivo",8,50), p("t65p9","Marcos Januário",9,56),
    p("t65p10","Roberto Kauer",10,53), p("t65p11","Raimundo Lobato",11,59), p("t65p12","Manoel Maciel",12,51),
    p("t65p13","Sebastião Marinho",13,62), p("t65p14","Geraldo Neves",14,55), p("t65p15","Hélio Octávio",15,58),
]};

const t66: Team = { id: 66, name: "Legends do BNB", sport: football, players: [
    p("t66p1","Edson Pacheco",1,54), p("t66p2","Nilton Quadros",2,57), p("t66p3","Waldir Ramos",3,51),
    p("t66p4","Rui Salgado",4,60), p("t66p5","Armindo Tanaka",5,53), p("t66p6","Celso Ulhoa",6,56),
    p("t66p7","Clóvis Viana",7,50), p("t66p8","Dario Werneck",8,62), p("t66p9","Edvaldo Abreu",9,55),
    p("t66p10","Filinto Borba",10,58), p("t66p11","Giancarlo Carmo",11,52), p("t66p12","Ivan Daltro",12,59),
    p("t66p13","Lindomar Enéas",13,54), p("t66p14","Mário Falqueto",14,57), p("t66p15","Nestor Germano",15,61),
]};

const t67: Team = { id: 67, name: "Seniores Dourados", sport: football, players: [
    p("t67p1","Onézio Herculano",1,50), p("t67p2","Quirino Imperiano",2,55), p("t67p3","Romeu Jasmim",3,60),
    p("t67p4","José Kléber",4,53), p("t67p5","Antônio Linhares",5,58), p("t67p6","Francisco Matos",6,51),
    p("t67p7","João Neco",7,56), p("t67p8","Carlos Omena",8,62), p("t67p9","Luiz Portela",9,54),
    p("t67p10","Paulo Quito",10,57), p("t67p11","Pedro Rattes",11,50), p("t67p12","Marcos Salomão",12,59),
    p("t67p13","Roberto Taveira",13,53), p("t67p14","Raimundo Ulisses",14,56), p("t67p15","Manoel Valentim",15,61),
]};

const t68: Team = { id: 68, name: "Mestres da Bola", sport: football, players: [
    p("t68p1","Sebastião Walmor",1,55), p("t68p2","Geraldo Abdon",2,58), p("t68p3","Hélio Acácio",3,51),
    p("t68p4","Edson Adaílton",4,60), p("t68p5","Nilton Badu",5,53), p("t68p6","Waldir Carmelo",6,57),
    p("t68p7","Rui Dodô",7,50), p("t68p8","Armindo Ernando",8,62), p("t68p9","Celso Fafá",9,55),
    p("t68p10","Clóvis Guga",10,58), p("t68p11","Dario Hulk",11,51), p("t68p12","Edvaldo Índio",12,54),
    p("t68p13","Filinto Jô",13,57), p("t68p14","Giancarlo Kaká",14,50), p("t68p15","Ivan Léo",15,59),
]};

const t69: Team = { id: 69, name: "Galera dos 50+", sport: football, players: [
    p("t69p1","Lindomar Luizão",1,53), p("t69p2","Mário Meia",2,56), p("t69p3","Nestor Mineiro",3,61),
    p("t69p4","Onézio Neto",4,52), p("t69p5","Quirino Nico",5,57), p("t69p6","Romeu Pardal",6,50),
    p("t69p7","José Pipoca",7,60), p("t69p8","Antônio Queque",8,53), p("t69p9","Francisco Ratão",9,58),
    p("t69p10","João Saci",10,51), p("t69p11","Carlos Toco",11,56), p("t69p12","Luiz Urubu",12,62),
    p("t69p13","Paulo Xerém",13,55), p("t69p14","Pedro Zezé",14,58), p("t69p15","Marcos Aílton",15,51),
]};

const t70: Team = { id: 70, name: "Patrimônio Vivo", sport: football, players: [
    p("t70p1","Roberto Baiano",1,54), p("t70p2","Raimundo Carioca",2,57), p("t70p3","Manoel Dendê",3,50),
    p("t70p4","Sebastião Fio",4,62), p("t70p5","Geraldo Galega",5,55), p("t70p6","Hélio Gringo",6,58),
    p("t70p7","Edson Jacaré",7,51), p("t70p8","Nilton Japa",8,56), p("t70p9","Waldir Ladrão",9,53),
    p("t70p10","Rui Laranjinha",10,59), p("t70p11","Armindo Lobão",11,52), p("t70p12","Celso Magrão",12,57),
    p("t70p13","Clóvis Mendigo",13,60), p("t70p14","Dario Mosquito",14,54), p("t70p15","Edvaldo Muié",15,61),
]};

const t71: Team = { id: 71, name: "Pensão do Gol", sport: football, players: [
    p("t71p1","Filinto Naná",1,53), p("t71p2","Giancarlo Neguinho",2,56), p("t71p3","Ivan Peba",3,50),
    p("t71p4","Lindomar Petisco",4,60), p("t71p5","Mário Pezão",5,55), p("t71p6","Nestor Pikachu",6,58),
    p("t71p7","Onézio Popó",7,51), p("t71p8","Quirino Robinho",8,62), p("t71p9","Romeu Rôbson",9,54),
    p("t71p10","José Ronaldinho",10,57), p("t71p11","Antônio Sabiá",11,50), p("t71p12","Francisco Serginho",12,55),
    p("t71p13","João Sorriso",13,59), p("t71p14","Carlos Tatu",14,52), p("t71p15","Luiz Tchê",15,58),
]};

const t72: Team = { id: 72, name: "Capitães da Aposentadoria", sport: football, players: [
    p("t72p1","Paulo Tinga",1,55), p("t72p2","Pedro Tonho",2,60), p("t72p3","Marcos Torricelli",3,51),
    p("t72p4","Roberto Tucano",4,56), p("t72p5","Raimundo Vampeta",5,62), p("t72p6","Manoel Vandinho",6,53),
    p("t72p7","Sebastião Venâncio",7,57), p("t72p8","Geraldo Vevê",8,50), p("t72p9","Hélio Wagnão",9,54),
    p("t72p10","Edson Zaga",10,58), p("t72p11","Nilton Zeca",11,51), p("t72p12","Waldir Zequinha",12,59),
    p("t72p13","Rui Zico",13,53), p("t72p14","Armindo Zinho",14,56), p("t72p15","Celso Zito",15,62),
]};

const t73: Team = { id: 73, name: "Craques da Gerência", sport: football, players: [
    p("t73p1","Clóvis Zizinho",1,55), p("t73p2","Dario Zoinho",2,58), p("t73p3","Edvaldo Zuzu",3,51),
    p("t73p4","Filinto Abaeté",4,60), p("t73p5","Giancarlo Abílio",5,53), p("t73p6","Ivan Abimael",6,57),
    p("t73p7","Lindomar Abílio",7,50), p("t73p8","Mário Abrão",8,62), p("t73p9","Nestor Abreu",9,55),
    p("t73p10","Onézio Acácio",10,58), p("t73p11","Quirino Adair",11,51), p("t73p12","Romeu Adalberto",12,54),
    p("t73p13","José Adalto",13,57), p("t73p14","Antônio Adão",14,50), p("t73p15","Francisco Adauto",15,59),
]};

const t74: Team = { id: 74, name: "Dinossauros do Norte", sport: football, players: [
    p("t74p1","João Adelino",1,53), p("t74p2","Carlos Ademar",2,56), p("t74p3","Luiz Ademilson",3,61),
    p("t74p4","Paulo Adenor",4,52), p("t74p5","Pedro Aderaldo",5,57), p("t74p6","Marcos Aderson",6,50),
    p("t74p7","Roberto Adevaldo",7,60), p("t74p8","Raimundo Adilson",8,53), p("t74p9","Manoel Adílio",9,58),
    p("t74p10","Sebastião Adilson",10,51), p("t74p11","Geraldo Adílio",11,56), p("t74p12","Hélio Adimar",12,62),
    p("t74p13","Edson Adinaldo",13,55), p("t74p14","Nilton Adílio",14,58), p("t74p15","Waldir Adino",15,51),
]};

const t75: Team = { id: 75, name: "Clássicos da Empresa", sport: football, players: [
    p("t75p1","Rui Adir",1,54), p("t75p2","Armindo Adivaldo",2,57), p("t75p3","Celso Adlai",3,50),
    p("t75p4","Clóvis Admar",4,62), p("t75p5","Dario Admário",5,55), p("t75p6","Edvaldo Adnilson",6,58),
    p("t75p7","Filinto Adolfo",7,51), p("t75p8","Giancarlo Adônio",8,56), p("t75p9","Ivan Adoraldo",9,53),
    p("t75p10","Lindomar Adoval",10,59), p("t75p11","Mário Adriano",11,52), p("t75p12","Nestor Aécio",12,57),
    p("t75p13","Onézio Afrânio",13,60), p("t75p14","Quirino Afro",14,54), p("t75p15","Romeu Afonso",15,61),
]};

const t76: Team = { id: 76, name: "Troféus do Banco", sport: football, players: [
    p("t76p1","José Agamenon",1,53), p("t76p2","Antônio Agesilau",2,56), p("t76p3","Francisco Ageu",3,50),
    p("t76p4","João Agidio",4,60), p("t76p5","Carlos Agildo",5,55), p("t76p6","Luiz Agilio",6,58),
    p("t76p7","Paulo Aginaldo",7,51), p("t76p8","Pedro Agmar",8,62), p("t76p9","Marcos Agnel",9,54),
    p("t76p10","Roberto Agostinho",10,57), p("t76p11","Raimundo Agosto",11,50), p("t76p12","Manoel Agrimério",12,55),
    p("t76p13","Sebastião Aguinaldo",13,59), p("t76p14","Geraldo Agustín",14,52), p("t76p15","Hélio Aharon",15,58),
]};

const t77: Team = { id: 77, name: "Sábios da Quadra", sport: football, players: [
    p("t77p1","Edson Alair",1,55), p("t77p2","Nilton Alamiro",2,58), p("t77p3","Waldir Alandino",3,51),
    p("t77p4","Rui Alano",4,60), p("t77p5","Armindo Alato",5,53), p("t77p6","Celso Alber",6,57),
    p("t77p7","Clóvis Albertino",7,50), p("t77p8","Dario Alberto",8,62), p("t77p9","Edvaldo Albertônio",9,55),
    p("t77p10","Filinto Albino",10,58), p("t77p11","Giancarlo Albino",11,51), p("t77p12","Ivan Albor",12,54),
    p("t77p13","Lindomar Alcebíades",13,57), p("t77p14","Mário Alcides",14,50), p("t77p15","Nestor Alcimirio",15,59),
]};

const t78: Team = { id: 78, name: "Lendas do Seridó", sport: football, players: [
    p("t78p1","Onézio Alcindo",1,53), p("t78p2","Quirino Alcino",2,56), p("t78p3","Romeu Alcíone",3,61),
    p("t78p4","José Alcir",4,52), p("t78p5","Antônio Alclides",5,57), p("t78p6","Francisco Alcy",6,50),
    p("t78p7","João Aldemar",7,60), p("t78p8","Carlos Aldenir",8,53), p("t78p9","Luiz Aldeodato",9,58),
    p("t78p10","Paulo Aldérico",10,51), p("t78p11","Pedro Aldomiro",11,56), p("t78p12","Marcos Aldrino",12,62),
    p("t78p13","Roberto Aldui",13,55), p("t78p14","Raimundo Alecrim",14,58), p("t78p15","Manoel Alécio",15,51),
]};

const t79: Team = { id: 79, name: "Veteranos do Nordeste", sport: football, players: [
    p("t79p1","Sebastião Alencar",1,54), p("t79p2","Geraldo Alencastro",2,57), p("t79p3","Hélio Alercio",3,50),
    p("t79p4","Edson Alericton",4,62), p("t79p5","Nilton Alessandre",5,55), p("t79p6","Waldir Alessandro",6,58),
    p("t79p7","Rui Alésio",7,51), p("t79p8","Armindo Aleuder",8,56), p("t79p9","Celso Aleuton",9,53),
    p("t79p10","Clóvis Alevando",10,59), p("t79p11","Dario Alevino",11,52), p("t79p12","Edvaldo Alexânder",12,57),
    p("t79p13","Filinto Alexandro",13,60), p("t79p14","Giancarlo Alexício",14,54), p("t79p15","Ivan Alexío",15,61),
]};

const t80: Team = { id: 80, name: "Grisalhos do BNB", sport: football, players: [
    p("t80p1","Lindomar Alexsander",1,53), p("t80p2","Mário Alexsandro",2,56), p("t80p3","Nestor Alexsio",3,50),
    p("t80p4","Onézio Alexys",4,60), p("t80p5","Quirino Alfena",5,55), p("t80p6","Romeu Alfenas",6,58),
    p("t80p7","José Alfeno",7,51), p("t80p8","Antônio Alfeu",8,62), p("t80p9","Francisco Alfino",9,54),
    p("t80p10","João Alfirio",10,57), p("t80p11","Carlos Alfonco",11,50), p("t80p12","Luiz Alfonsino",12,55),
    p("t80p13","Paulo Alfredo",13,59), p("t80p14","Pedro Algertino",14,52), p("t80p15","Marcos Algir",15,58),
]};

// ──────────────────────────────────────────────
// COMP 6 — Futebol Masculino (Copa)
// Times 81-96 | Idades 22-45
// ──────────────────────────────────────────────

const t81: Team = { id: 81, name: "Casados Bravos", sport: football, players: [
    p("t81p1","Thiago Almeida",1,35), p("t81p2","Leandro Brandão",2,28), p("t81p3","Alexandre Coutinho",3,42),
    p("t81p4","Marcelo Drummond",4,31), p("t81p5","Alan Evangelista",5,37), p("t81p6","Renato Figueiredo",6,45),
    p("t81p7","Fernando Guimarães",7,29), p("t81p8","Sandro Honorato",8,38), p("t81p9","Everton Ibiapina",9,22),
    p("t81p10","Alex Justino",10,33), p("t81p11","Danilo Koslowski",11,40), p("t81p12","Breno Lacerda",12,27),
    p("t81p13","Cássio Machado",13,36), p("t81p14","Murilo Novais",14,43), p("t81p15","Kaique Olveira",15,25),
]};

const t82: Team = { id: 82, name: "Solteiros Unidos", sport: football, players: [
    p("t82p1","Ruan Palmeira",1,24), p("t82p2","Yago Queiroz",2,30), p("t82p3","Mateus Ramalho",3,26),
    p("t82p4","Vinícius Saraiva",4,22), p("t82p5","Gael Tibúrcio",5,34), p("t82p6","Ian Ulisses",6,28),
    p("t82p7","Luan Vasconcellos",7,38), p("t82p8","Cauã Wanderley",8,23), p("t82p9","Noah Xavier",9,31),
    p("t82p10","Erick Yamamoto",10,27), p("t82p11","Bernardo Zagallo",11,42), p("t82p12","Lorenzo Abrantes",12,25),
    p("t82p13","Bento Barreto",13,36), p("t82p14","Theo Calixto",14,29), p("t82p15","Heitor Delgado",15,33),
]};

const t83: Team = { id: 83, name: "Aliança do Gol", sport: football, players: [
    p("t83p1","Vicente Espíndola",1,38), p("t83p2","Bryan Falcão",2,32), p("t83p3","Kauê Galvão",3,26),
    p("t83p4","Tales Henriques",4,41), p("t83p5","Átila Isidoro",5,28), p("t83p6","Renan Jardim",6,35),
    p("t83p7","Vitor Krause",7,22), p("t83p8","Carlos Leitão",8,44), p("t83p9","Marcos Menezes",9,30),
    p("t83p10","Luiz Negrão",10,37), p("t83p11","Paulo Otávio",11,25), p("t83p12","Pedro Pinheiro",12,40),
    p("t83p13","João Quintela",13,33), p("t83p14","Lucas Rego",14,27), p("t83p15","Gabriel Sabino",15,43),
]};

const t84: Team = { id: 84, name: "Coroa & Chuteira", sport: football, players: [
    p("t84p1","Matheus Torres",1,31), p("t84p2","Victor Urquiza",2,39), p("t84p3","Rafael Vasconcelos",3,24),
    p("t84p4","Gustavo Weiss",4,36), p("t84p5","Felipe Albuquerque",5,28), p("t84p6","André Bezerra",6,45),
    p("t84p7","Bruno Cavalcante",7,32), p("t84p8","Leonardo Dantas",8,23), p("t84p9","Diego Esteves",9,40),
    p("t84p10","Carlos Fontes",10,27), p("t84p11","Miguel Guerreiro",11,35), p("t84p12","Henrique Ivo",12,22),
    p("t84p13","Arthur Januário",13,43), p("t84p14","Enzo Kauer",14,29), p("t84p15","Thiago Lobato",15,37),
]};

const t85: Team = { id: 85, name: "Ring e Rede FC", sport: football, players: [
    p("t85p1","Igor Maciel",1,33), p("t85p2","Eduardo Marinho",2,26), p("t85p3","Caio Neves",3,41),
    p("t85p4","Natan Octávio",4,28), p("t85p5","Davi Pacheco",5,35), p("t85p6","Samuel Quadros",6,22),
    p("t85p7","Raul Ramos",7,44), p("t85p8","Nicolas Salgado",8,30), p("t85p9","Daniel Tanaka",9,37),
    p("t85p10","Fábio Ulhoa",10,25), p("t85p11","Alan Viana",11,39), p("t85p12","Renato Werneck",12,27),
    p("t85p13","Leandro Abreu",13,42), p("t85p14","Tiago Borba",14,31), p("t85p15","Wilson Carmo",15,24),
]};

const t86: Team = { id: 86, name: "Célibatários do BNB", sport: football, players: [
    p("t86p1","Wagner Daltro",1,29), p("t86p2","Willian Enéas",2,36), p("t86p3","Edmilson Falqueto",3,23),
    p("t86p4","Cleber Germano",4,40), p("t86p5","Nelinho Herculano",5,27), p("t86p6","Juninho Imperiano",6,33),
    p("t86p7","Paulinho Jasmim",7,45), p("t86p8","Adriano Kléber",8,28), p("t86p9","Emerson Linhares",9,35),
    p("t86p10","Fabiano Matos",10,22), p("t86p11","Claudinho Neco",11,38), p("t86p12","Ricardinho Omena",12,31),
    p("t86p13","Fernando Portela",13,26), p("t86p14","Sandro Quito",14,43), p("t86p15","Everton Rattes",15,30),
]};

const t87: Team = { id: 87, name: "Esposa Mandou Jogar", sport: football, players: [
    p("t87p1","Alex Salomão",1,37), p("t87p2","Danilo Taveira",2,24), p("t87p3","Breno Ulisses",3,41),
    p("t87p4","Cássio Valentim",4,29), p("t87p5","Murilo Walmor",5,35), p("t87p6","Kaique Abdon",6,22),
    p("t87p7","Ruan Acácio",7,44), p("t87p8","Yago Adaílton",8,31), p("t87p9","Mateus Badu",9,27),
    p("t87p10","Vinícius Carmelo",10,38), p("t87p11","Gael Dodô",11,33), p("t87p12","Ian Ernando",12,25),
    p("t87p13","Luan Fafá",13,40), p("t87p14","Cauã Guga",14,28), p("t87p15","Noah Hulk",15,36),
]};

const t88: Team = { id: 88, name: "Solteirões Raivosos", sport: football, players: [
    p("t88p1","Erick Índio",1,23), p("t88p2","Bernardo Jô",2,31), p("t88p3","Lorenzo Kaká",3,38),
    p("t88p4","Bento Léo",4,26), p("t88p5","Theo Luizão",5,43), p("t88p6","Heitor Meia",6,29),
    p("t88p7","Vicente Mineiro",7,35), p("t88p8","Bryan Neto",8,22), p("t88p9","Kauê Nico",9,40),
    p("t88p10","Tales Pardal",10,27), p("t88p11","Átila Pipoca",11,34), p("t88p12","Renan Queca",12,24),
    p("t88p13","Vitor Ratão",13,39), p("t88p14","Carlos Saci",14,31), p("t88p15","Marcos Toco",15,45),
]};

const t89: Team = { id: 89, name: "Maridos de Ouro", sport: football, players: [
    p("t89p1","Luiz Urubu",1,36), p("t89p2","Paulo Xerém",2,28), p("t89p3","Pedro Zé",3,42),
    p("t89p4","João Aílton",4,33), p("t89p5","Lucas Baiano",5,25), p("t89p6","Gabriel Carioca",6,40),
    p("t89p7","Matheus Dendê",7,27), p("t89p8","Victor Fio",8,37), p("t89p9","Rafael Galega",9,22),
    p("t89p10","Gustavo Gringo",10,44), p("t89p11","Felipe Jacaré",11,30), p("t89p12","André Japa",12,35),
    p("t89p13","Bruno Ladrão",13,26), p("t89p14","Leonardo Laranjinha",14,41), p("t89p15","Diego Lobão",15,29),
]};

const t90: Team = { id: 90, name: "Noivados Furiosos", sport: football, players: [
    p("t90p1","Carlos Magrão",1,34), p("t90p2","Miguel Mendigo",2,23), p("t90p3","Henrique Mosquito",3,38),
    p("t90p4","Arthur Muié",4,28), p("t90p5","Enzo Naná",5,42), p("t90p6","Thiago Neguinho",6,25),
    p("t90p7","Igor Peba",7,36), p("t90p8","Eduardo Petisco",8,31), p("t90p9","Caio Pezão",9,22),
    p("t90p10","Natan Pikachu",10,39), p("t90p11","Davi Popó",11,27), p("t90p12","Samuel Robinho",12,45),
    p("t90p13","Raul Rôbson",13,32), p("t90p14","Nicolas Ronaldinho",14,29), p("t90p15","Daniel Sabiá",15,37),
]};

const t91: Team = { id: 91, name: "Chuteiras Livres", sport: football, players: [
    p("t91p1","Fábio Serginho",1,24), p("t91p2","Alan Sorriso",2,40), p("t91p3","Renato Tatu",3,33),
    p("t91p4","Leandro Tchê",4,26), p("t91p5","Tiago Tinga",5,38), p("t91p6","Wilson Tonho",6,22),
    p("t91p7","Wagner Torricelli",7,43), p("t91p8","Willian Tucano",8,29), p("t91p9","Edmilson Vampeta",9,35),
    p("t91p10","Cleber Vandinho",10,27), p("t91p11","Nelinho Venâncio",11,41), p("t91p12","Juninho Vevê",12,31),
    p("t91p13","Paulinho Vinicius",13,23), p("t91p14","Adriano Wagnão",14,36), p("t91p15","Emerson Zaga",15,44),
]};

const t92: Team = { id: 92, name: "Bola e Aliança FC", sport: football, players: [
    p("t92p1","Fabiano Zeca",1,30), p("t92p2","Claudinho Abreu",2,37), p("t92p3","Ricardinho Acosta",3,25),
    p("t92p4","Fernando Aguinaldo",4,42), p("t92p5","Sandro Aldair",5,28), p("t92p6","Everton Aleixo",6,35),
    p("t92p7","Alex Alencar",7,22), p("t92p8","Danilo Alexsandro",8,39), p("t92p9","Breno Almir",9,31),
    p("t92p10","Cássio Almirante",10,27), p("t92p11","Murilo Altemir",11,44), p("t92p12","Kaique Aluno",12,33),
    p("t92p13","Ruan Amaro",13,24), p("t92p14","Yago Amarildo",14,40), p("t92p15","Mateus Amigos",15,29),
]};

const t93: Team = { id: 93, name: "Prometidos FC", sport: football, players: [
    p("t93p1","Vinícius Ancheta",1,36), p("t93p2","Gael Andorinha",2,23), p("t93p3","Ian Angélico",3,41),
    p("t93p4","Luan Antenor",4,28), p("t93p5","Cauã Antero",5,34), p("t93p6","Noah Antônio",6,22),
    p("t93p7","Erick Aparício",7,45), p("t93p8","Bernardo Apolo",8,30), p("t93p9","Lorenzo Aquino",9,37),
    p("t93p10","Bento Araquém",10,25), p("t93p11","Theo Aristeu",11,39), p("t93p12","Heitor Arnaldo",12,27),
    p("t93p13","Vicente Aroldo",13,43), p("t93p14","Bryan Artur",14,31), p("t93p15","Kauê Arvid",15,26),
]};

const t94: Team = { id: 94, name: "BNB Unleashed", sport: football, players: [
    p("t94p1","Tales Asdrúbal",1,32), p("t94p2","Átila Assunção",2,24), p("t94p3","Renan Ataide",3,40),
    p("t94p4","Vitor Athos",4,27), p("t94p5","Carlos Augusto",5,36), p("t94p6","Marcos Aurélio",6,22),
    p("t94p7","Luiz Avelino",7,44), p("t94p8","Paulo Avner",8,29), p("t94p9","Pedro Axel",9,35),
    p("t94p10","João Ayres",10,31), p("t94p11","Lucas Azael",11,23), p("t94p12","Gabriel Azário",12,38),
    p("t94p13","Matheus Azevedo",13,26), p("t94p14","Victor Aziz",14,42), p("t94p15","Rafael Azor",15,30),
]};

const t95: Team = { id: 95, name: "Os Solteirões", sport: football, players: [
    p("t95p1","Gustavo Bacelar",1,25), p("t95p2","Felipe Bachega",2,33), p("t95p3","André Bagnato",3,27),
    p("t95p4","Bruno Baiano",4,41), p("t95p5","Leonardo Bairro",5,29), p("t95p6","Diego Balaguer",6,36),
    p("t95p7","Carlos Baldo",7,22), p("t95p8","Miguel Baldoíno",8,39), p("t95p9","Henrique Balthazar",9,31),
    p("t95p10","Arthur Bamberg",10,45), p("t95p11","Enzo Bandeira",11,26), p("t95p12","Thiago Baniwa",12,34),
    p("t95p13","Igor Baptista",13,28), p("t95p14","Eduardo Baracho",14,42), p("t95p15","Caio Barbalho",15,23),
]};

const t96: Team = { id: 96, name: "Aliança Dourada", sport: football, players: [
    p("t96p1","Natan Barberino",1,37), p("t96p2","Davi Barbieri",2,25), p("t96p3","Samuel Bareiro",3,40),
    p("t96p4","Raul Baroni",4,28), p("t96p5","Nicolas Barrada",5,33), p("t96p6","Daniel Barreira",6,22),
    p("t96p7","Fábio Barros",7,44), p("t96p8","Alan Barrozo",8,30), p("t96p9","Renato Barrueto",9,36),
    p("t96p10","Leandro Bartolomeu",10,24), p("t96p11","Tiago Basílio",11,41), p("t96p12","Wilson Bastos",12,27),
    p("t96p13","Wagner Batata",13,35), p("t96p14","Willian Batinga",14,23), p("t96p15","Edmilson Bauer",15,38),
]};

export const mockTeams: Team[] = [
    // Comp 1 — FundII Masc
    t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16,
    // Comp 2 — EM Masc
    t17, t18, t19, t20, t21, t22, t23, t24, t25, t26, t27, t28, t29, t30, t31, t32,
    // Comp 3 — FundII Fem
    t33, t34, t35, t36, t37, t38, t39, t40, t41, t42, t43, t44, t45, t46, t47, t48,
    // Comp 4 — EM Fem
    t49, t50, t51, t52, t53, t54, t55, t56, t57, t58, t59, t60, t61, t62, t63, t64,
    // Comp 5 — Sênior 50+
    t65, t66, t67, t68, t69, t70, t71, t72, t73, t74, t75, t76, t77, t78, t79, t80,
    // Comp 6 — Copa Masculino
    t81, t82, t83, t84, t85, t86, t87, t88, t89, t90, t91, t92, t93, t94, t95, t96,
];
