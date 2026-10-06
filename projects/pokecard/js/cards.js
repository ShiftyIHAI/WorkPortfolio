'use strict';

const IMG = {
  s11:  n  => `https://images.pokemontcg.io/swsh11/${n}_hires.png`,
  tg:   n  => `https://images.pokemontcg.io/swsh11tg/${n}_hires.png`,
};

// ── TYPE VISUALS (fallback / foil overlay tint) ─────────────────
const TYPE_CONFIG = {
  Lightning: { primary:'#F59E0B', secondary:'#92400E', symbol:'⚡', text:'#1a0a00' },
  Psychic:   { primary:'#A855F7', secondary:'#581C87', symbol:'ψ',  text:'#fff'    },
  Darkness:  { primary:'#6B7280', secondary:'#111827', symbol:'◈',  text:'#fff'    },
  Dragon:    { primary:'#6366F1', secondary:'#1E1B4B', symbol:'⟡',  text:'#fff'    },
  Water:     { primary:'#3B82F6', secondary:'#1E3A5F', symbol:'≋',  text:'#fff'    },
  Grass:     { primary:'#22C55E', secondary:'#14532D', symbol:'✿',  text:'#fff'    },
  Fire:      { primary:'#EF4444', secondary:'#7F1D1D', symbol:'✸',  text:'#fff'    },
  Fighting:  { primary:'#D97706', secondary:'#78350F', symbol:'✦',  text:'#fff'    },
  Metal:     { primary:'#94A3B8', secondary:'#334155', symbol:'⬡',  text:'#fff'    },
  Colorless: { primary:'#CBD5E1', secondary:'#64748B', symbol:'○',  text:'#1a1a2e' },
  Trainer:   { primary:'#06B6D4', secondary:'#0C4A6E', symbol:'✦',  text:'#fff'    },
};

// ── RARITIES ────────────────────────────────────────────────────
const RARITY_CONFIG = {
  'common':                    { label:'Common',                    symbol:'●',     tier:1,  holo:false, rainbow:false },
  'uncommon':                  { label:'Uncommon',                  symbol:'◆',     tier:2,  holo:false, rainbow:false },
  'rare':                      { label:'Rare',                      symbol:'★',     tier:3,  holo:false, rainbow:false },
  'holo-rare':                 { label:'Holo Rare',                 symbol:'★',     tier:4,  holo:true,  rainbow:false },
  'reverse-holo':              { label:'Reverse Holo',              symbol:'◆R',    tier:3,  holo:true,  rainbow:false },
  'radiant-rare':              { label:'Radiant Rare',              symbol:'✦',     tier:5,  holo:true,  rainbow:false },
  'v':                         { label:'Pokémon V',                 symbol:'V',     tier:6,  holo:true,  rainbow:false },
  'vmax':                      { label:'Pokémon VMAX',              symbol:'VMAX',  tier:7,  holo:true,  rainbow:false },
  'vstar':                     { label:'Pokémon VSTAR',             symbol:'VSTAR', tier:7,  holo:true,  rainbow:false },
  'trainer-gallery':           { label:'Trainer Gallery',           symbol:'TG',    tier:5,  holo:true,  rainbow:false },
  'trainer-gallery-v':         { label:'Trainer Gallery V',         symbol:'TGV',   tier:6,  holo:true,  rainbow:false },
  'trainer-gallery-vmax':      { label:'Trainer Gallery VMAX',      symbol:'TGVM',  tier:7,  holo:true,  rainbow:false },
  'trainer-gallery-ultra':     { label:'Trainer Gallery Ultra Rare',symbol:'TGU',   tier:7,  holo:true,  rainbow:false },
  'ultra-rare':                { label:'Alt Art',                   symbol:'✦✦',    tier:8,  holo:true,  rainbow:false },
  'rainbow-rare':              { label:'Rainbow Rare',              symbol:'✦✦✦',   tier:8,  holo:true,  rainbow:true  },
  'secret-rare':               { label:'Secret Rare (Gold)',        symbol:'★★',    tier:8,  holo:true,  rainbow:false },
  'special-illustration-rare': { label:'Special Illustration Rare', symbol:'SIR',   tier:9,  holo:true,  rainbow:true  },
};

function sellTokens(price) { return Math.max(1, Math.round(price * 10 * 0.55)); }

// sortKey: main-set cards sort by number, TG cards sort after (300+)
const CARDS = {

  // ═══════════════════════════════════════════════════════════════
  // SECTION 1 — GRASS (001–020)
  // ═══════════════════════════════════════════════════════════════
  '001': { id:'001', name:'Oddish',              num:'001/196', sortKey:1,   rarity:'common',    type:'Grass',     hp:50,  price:0.06, img:IMG.s11(1)   },
  '002': { id:'002', name:'Gloom',               num:'002/196', sortKey:2,   rarity:'common',    type:'Grass',     hp:80,  price:0.06, img:IMG.s11(2)   },
  '003': { id:'003', name:'Vileplume',            num:'003/196', sortKey:3,   rarity:'holo-rare', type:'Grass',     hp:150, price:1.00, img:IMG.s11(3)   },
  '004': { id:'004', name:'Paras',               num:'004/196', sortKey:4,   rarity:'common',    type:'Grass',     hp:70,  price:0.06, img:IMG.s11(4)   },
  '005': { id:'005', name:'Parasect',            num:'005/196', sortKey:5,   rarity:'uncommon',  type:'Grass',     hp:120, price:0.12, img:IMG.s11(5)   },
  '006': { id:'006', name:'Wurmple',             num:'006/196', sortKey:6,   rarity:'common',    type:'Grass',     hp:60,  price:0.05, img:IMG.s11(6)   },
  '007': { id:'007', name:'Silcoon',             num:'007/196', sortKey:7,   rarity:'common',    type:'Grass',     hp:80,  price:0.05, img:IMG.s11(7)   },
  '008': { id:'008', name:'Beautifly',           num:'008/196', sortKey:8,   rarity:'holo-rare', type:'Grass',     hp:130, price:1.00, img:IMG.s11(8)   },
  '009': { id:'009', name:'Cascoon',             num:'009/196', sortKey:9,   rarity:'common',    type:'Grass',     hp:80,  price:0.05, img:IMG.s11(9)   },
  '010': { id:'010', name:'Dustox',              num:'010/196', sortKey:10,  rarity:'uncommon',  type:'Grass',     hp:140, price:0.12, img:IMG.s11(10)  },
  '011': { id:'011', name:'Seedot',              num:'011/196', sortKey:11,  rarity:'common',    type:'Grass',     hp:50,  price:0.05, img:IMG.s11(11)  },
  '012': { id:'012', name:'Nuzleaf',             num:'012/196', sortKey:12,  rarity:'uncommon',  type:'Grass',     hp:80,  price:0.10, img:IMG.s11(12)  },
  '013': { id:'013', name:'Shiftry',             num:'013/196', sortKey:13,  rarity:'holo-rare', type:'Grass',     hp:160, price:1.00, img:IMG.s11(13)  },
  '014': { id:'014', name:'Roselia',             num:'014/196', sortKey:14,  rarity:'common',    type:'Grass',     hp:70,  price:0.06, img:IMG.s11(14)  },
  '015': { id:'015', name:'Roserade',            num:'015/196', sortKey:15,  rarity:'uncommon',  type:'Grass',     hp:120, price:0.12, img:IMG.s11(15)  },
  '016': { id:'016', name:'Phantump',            num:'016/196', sortKey:16,  rarity:'common',    type:'Grass',     hp:70,  price:0.06, img:IMG.s11(16)  },
  '017': { id:'017', name:'Trevenant',           num:'017/196', sortKey:17,  rarity:'holo-rare', type:'Grass',     hp:120, price:1.00, img:IMG.s11(17)  },
  '018': { id:'018', name:'Blipbug',             num:'018/196', sortKey:18,  rarity:'common',    type:'Grass',     hp:50,  price:0.05, img:IMG.s11(18)  },
  '019': { id:'019', name:'Dottler',             num:'019/196', sortKey:19,  rarity:'common',    type:'Grass',     hp:80,  price:0.05, img:IMG.s11(19)  },
  '020': { id:'020', name:'Orbeetle',            num:'020/196', sortKey:20,  rarity:'holo-rare', type:'Grass',     hp:110, price:1.00, img:IMG.s11(20)  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 2 — FIRE (021–029)
  // ═══════════════════════════════════════════════════════════════
  '021': { id:'021', name:'Slugma',              num:'021/196', sortKey:21,  rarity:'common',    type:'Fire',      hp:70,  price:0.05, img:IMG.s11(21)  },
  '022': { id:'022', name:'Magcargo',            num:'022/196', sortKey:22,  rarity:'uncommon',  type:'Fire',      hp:130, price:0.12, img:IMG.s11(22)  },
  '023': { id:'023', name:'Torkoal',             num:'023/196', sortKey:23,  rarity:'common',    type:'Fire',      hp:110, price:0.06, img:IMG.s11(23)  },
  '024': { id:'024', name:'Litwick',             num:'024/196', sortKey:24,  rarity:'common',    type:'Fire',      hp:60,  price:0.08, img:IMG.s11(24)  },
  '025': { id:'025', name:'Lampent',             num:'025/196', sortKey:25,  rarity:'common',    type:'Fire',      hp:80,  price:0.06, img:IMG.s11(25)  },
  '026': { id:'026', name:'Chandelure',          num:'026/196', sortKey:26,  rarity:'holo-rare', type:'Fire',      hp:150, price:1.25, img:IMG.s11(26)  },
  '027': { id:'027', name:'Delphox V',           num:'027/196', sortKey:27,  rarity:'v',         type:'Fire',      hp:210, price:1.00, img:IMG.s11(27)  },
  '028': { id:'028', name:'Litleo',              num:'028/196', sortKey:28,  rarity:'common',    type:'Fire',      hp:70,  price:0.06, img:IMG.s11(28)  },
  '029': { id:'029', name:'Pyroar',              num:'029/196', sortKey:29,  rarity:'uncommon',  type:'Fire',      hp:120, price:0.12, img:IMG.s11(29)  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 3 — WATER (030–051)
  // ═══════════════════════════════════════════════════════════════
  '030': { id:'030', name:'Poliwag',             num:'030/196', sortKey:30,  rarity:'common',    type:'Water',     hp:60,  price:0.05, img:IMG.s11(30)  },
  '031': { id:'031', name:'Poliwhirl',           num:'031/196', sortKey:31,  rarity:'common',    type:'Water',     hp:90,  price:0.05, img:IMG.s11(31)  },
  '032': { id:'032', name:'Politoed',            num:'032/196', sortKey:32,  rarity:'uncommon',  type:'Water',     hp:140, price:0.12, img:IMG.s11(32)  },
  '033': { id:'033', name:'Seel',                num:'033/196', sortKey:33,  rarity:'common',    type:'Water',     hp:70,  price:0.05, img:IMG.s11(33)  },
  '034': { id:'034', name:'Dewgong',             num:'034/196', sortKey:34,  rarity:'uncommon',  type:'Water',     hp:120, price:0.10, img:IMG.s11(34)  },
  '035': { id:'035', name:'Horsea',              num:'035/196', sortKey:35,  rarity:'common',    type:'Water',     hp:50,  price:0.05, img:IMG.s11(35)  },
  '036': { id:'036', name:'Seadra',              num:'036/196', sortKey:36,  rarity:'uncommon',  type:'Water',     hp:80,  price:0.10, img:IMG.s11(36)  },
  '037': { id:'037', name:'Kingdra',             num:'037/196', sortKey:37,  rarity:'holo-rare', type:'Water',     hp:150, price:1.00, img:IMG.s11(37)  },
  '038': { id:'038', name:'Luvdisc',             num:'038/196', sortKey:38,  rarity:'common',    type:'Water',     hp:70,  price:0.05, img:IMG.s11(38)  },
  '039': { id:'039', name:'Shellos',             num:'039/196', sortKey:39,  rarity:'common',    type:'Water',     hp:70,  price:0.05, img:IMG.s11(39)  },
  '040': { id:'040', name:'Finneon',             num:'040/196', sortKey:40,  rarity:'common',    type:'Water',     hp:50,  price:0.05, img:IMG.s11(40)  },
  '041': { id:'041', name:'Lumineon',            num:'041/196', sortKey:41,  rarity:'uncommon',  type:'Water',     hp:90,  price:0.10, img:IMG.s11(41)  },
  '042': { id:'042', name:'Snover',              num:'042/196', sortKey:42,  rarity:'common',    type:'Water',     hp:80,  price:0.05, img:IMG.s11(42)  },
  '043': { id:'043', name:'Abomasnow',           num:'043/196', sortKey:43,  rarity:'common',    type:'Water',     hp:140, price:0.06, img:IMG.s11(43)  },
  '044': { id:'044', name:'Hisuian Basculin',    num:'044/196', sortKey:44,  rarity:'common',    type:'Water',     hp:50,  price:0.06, img:IMG.s11(44)  },
  '045': { id:'045', name:'Hisuian Basculegion', num:'045/196', sortKey:45,  rarity:'holo-rare', type:'Water',     hp:110, price:1.00, img:IMG.s11(45)  },
  '046': { id:'046', name:'Ducklett',            num:'046/196', sortKey:46,  rarity:'common',    type:'Water',     hp:60,  price:0.05, img:IMG.s11(46)  },
  '047': { id:'047', name:'Swanna',              num:'047/196', sortKey:47,  rarity:'uncommon',  type:'Water',     hp:120, price:0.10, img:IMG.s11(47)  },
  '048': { id:'048', name:'Kyurem V',            num:'048/196', sortKey:48,  rarity:'v',         type:'Water',     hp:220, price:2.50, img:IMG.s11(48)  },
  '049': { id:'049', name:'Kyurem VMAX',         num:'049/196', sortKey:49,  rarity:'vmax',      type:'Water',     hp:330, price:4.00, img:IMG.s11(49)  },
  '050': { id:'050', name:'Cramorant',           num:'050/196', sortKey:50,  rarity:'uncommon',  type:'Water',     hp:110, price:0.20, img:IMG.s11(50)  },
  '051': { id:'051', name:'Glastrier',           num:'051/196', sortKey:51,  rarity:'holo-rare', type:'Water',     hp:130, price:1.00, img:IMG.s11(51)  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 4 — LIGHTNING (052–061)
  // ═══════════════════════════════════════════════════════════════
  '052': { id:'052', name:'Pikachu',             num:'052/196', sortKey:52,  rarity:'common',    type:'Lightning', hp:60,  price:0.25, img:IMG.s11(52)  },
  '053': { id:'053', name:'Raichu',              num:'053/196', sortKey:53,  rarity:'uncommon',  type:'Lightning', hp:120, price:0.20, img:IMG.s11(53)  },
  '054': { id:'054', name:'Electrike',           num:'054/196', sortKey:54,  rarity:'common',    type:'Lightning', hp:60,  price:0.05, img:IMG.s11(54)  },
  '055': { id:'055', name:'Manectric',           num:'055/196', sortKey:55,  rarity:'uncommon',  type:'Lightning', hp:120, price:0.12, img:IMG.s11(55)  },
  '056': { id:'056', name:'Magnezone V',         num:'056/196', sortKey:56,  rarity:'v',         type:'Lightning', hp:210, price:1.50, img:IMG.s11(56)  },
  '057': { id:'057', name:'Magnezone VSTAR',     num:'057/196', sortKey:57,  rarity:'vstar',     type:'Lightning', hp:270, price:4.00, img:IMG.s11(57)  },
  '058': { id:'058', name:'Rotom V',             num:'058/196', sortKey:58,  rarity:'v',         type:'Lightning', hp:190, price:1.50, img:IMG.s11(58)  },
  '059': { id:'059', name:'Tynamo',              num:'059/196', sortKey:59,  rarity:'common',    type:'Lightning', hp:30,  price:0.05, img:IMG.s11(59)  },
  '060': { id:'060', name:'Eelektrik',           num:'060/196', sortKey:60,  rarity:'common',    type:'Lightning', hp:80,  price:0.05, img:IMG.s11(60)  },
  '061': { id:'061', name:'Eelektross',          num:'061/196', sortKey:61,  rarity:'uncommon',  type:'Lightning', hp:160, price:0.15, img:IMG.s11(61)  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 5 — PSYCHIC (062–082)
  // ═══════════════════════════════════════════════════════════════
  '062': { id:'062', name:'Clefairy',            num:'062/196', sortKey:62,  rarity:'common',    type:'Psychic',   hp:60,  price:0.08, img:IMG.s11(62)  },
  '063': { id:'063', name:'Clefable',            num:'063/196', sortKey:63,  rarity:'uncommon',  type:'Psychic',   hp:100, price:0.20, img:IMG.s11(63)  },
  '064': { id:'064', name:'Gastly',              num:'064/196', sortKey:64,  rarity:'common',    type:'Psychic',   hp:40,  price:0.08, img:IMG.s11(64)  },
  '065': { id:'065', name:'Haunter',             num:'065/196', sortKey:65,  rarity:'common',    type:'Psychic',   hp:60,  price:0.08, img:IMG.s11(65)  },
  '066': { id:'066', name:'Gengar',              num:'066/196', sortKey:66,  rarity:'holo-rare', type:'Psychic',   hp:120, price:1.50, img:IMG.s11(66)  },
  '067': { id:'067', name:'Mr. Mime',            num:'067/196', sortKey:67,  rarity:'uncommon',  type:'Psychic',   hp:90,  price:0.12, img:IMG.s11(67)  },
  '068': { id:'068', name:'Jynx',                num:'068/196', sortKey:68,  rarity:'holo-rare', type:'Psychic',   hp:100, price:1.00, img:IMG.s11(68)  },
  '069': { id:'069', name:'Radiant Gardevoir',   num:'069/196', sortKey:69,  rarity:'radiant-rare', type:'Psychic', hp:130, price:6.00, img:IMG.s11(69) },
  '070': { id:'070', name:'Sableye',             num:'070/196', sortKey:70,  rarity:'holo-rare', type:'Psychic',   hp:80,  price:1.00, img:IMG.s11(70)  },
  '071': { id:'071', name:'Mawile',              num:'071/196', sortKey:71,  rarity:'common',    type:'Psychic',   hp:90,  price:0.06, img:IMG.s11(71)  },
  '072': { id:'072', name:'Shuppet',             num:'072/196', sortKey:72,  rarity:'common',    type:'Psychic',   hp:60,  price:0.05, img:IMG.s11(72)  },
  '073': { id:'073', name:'Banette',             num:'073/196', sortKey:73,  rarity:'uncommon',  type:'Psychic',   hp:100, price:0.15, img:IMG.s11(73)  },
  '074': { id:'074', name:'Cresselia',           num:'074/196', sortKey:74,  rarity:'holo-rare', type:'Psychic',   hp:120, price:1.00, img:IMG.s11(74)  },
  '075': { id:'075', name:'Hisuian Zorua',       num:'075/196', sortKey:75,  rarity:'common',    type:'Psychic',   hp:60,  price:0.10, img:IMG.s11(75)  },
  '076': { id:'076', name:'Hisuian Zoroark',     num:'076/196', sortKey:76,  rarity:'holo-rare', type:'Psychic',   hp:120, price:2.00, img:IMG.s11(76)  },
  '077': { id:'077', name:'Inkay',               num:'077/196', sortKey:77,  rarity:'common',    type:'Psychic',   hp:60,  price:0.05, img:IMG.s11(77)  },
  '078': { id:'078', name:'Malamar',             num:'078/196', sortKey:78,  rarity:'uncommon',  type:'Psychic',   hp:110, price:0.12, img:IMG.s11(78)  },
  '079': { id:'079', name:'Comfey',              num:'079/196', sortKey:79,  rarity:'uncommon',  type:'Psychic',   hp:70,  price:1.00, img:IMG.s11(79)  },
  '080': { id:'080', name:'Mimikyu',             num:'080/196', sortKey:80,  rarity:'uncommon',  type:'Psychic',   hp:70,  price:0.60, img:IMG.s11(80)  },
  '081': { id:'081', name:'Spectrier',           num:'081/196', sortKey:81,  rarity:'holo-rare', type:'Psychic',   hp:120, price:1.25, img:IMG.s11(81)  },
  '082': { id:'082', name:'Enamorus V',          num:'082/196', sortKey:82,  rarity:'v',         type:'Psychic',   hp:210, price:1.50, img:IMG.s11(82)  },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 6 — FIGHTING (083–111)
  // ═══════════════════════════════════════════════════════════════
  '083': { id:'083', name:'Hisuian Growlithe',   num:'083/196', sortKey:83,  rarity:'common',    type:'Fighting',  hp:70,  price:0.10, img:IMG.s11(83)  },
  '084': { id:'084', name:'Hisuian Arcanine',    num:'084/196', sortKey:84,  rarity:'holo-rare', type:'Fighting',  hp:130, price:1.50, img:IMG.s11(84)  },
  '085': { id:'085', name:'Poliwrath',           num:'085/196', sortKey:85,  rarity:'uncommon',  type:'Fighting',  hp:160, price:0.15, img:IMG.s11(85)  },
  '086': { id:'086', name:'Machop',              num:'086/196', sortKey:86,  rarity:'common',    type:'Fighting',  hp:70,  price:0.06, img:IMG.s11(86)  },
  '087': { id:'087', name:'Machoke',             num:'087/196', sortKey:87,  rarity:'uncommon',  type:'Fighting',  hp:100, price:0.10, img:IMG.s11(87)  },
  '088': { id:'088', name:'Machamp',             num:'088/196', sortKey:88,  rarity:'holo-rare', type:'Fighting',  hp:150, price:1.00, img:IMG.s11(88)  },
  '089': { id:'089', name:'Rhyhorn',             num:'089/196', sortKey:89,  rarity:'common',    type:'Fighting',  hp:100, price:0.05, img:IMG.s11(89)  },
  '090': { id:'090', name:'Rhydon',              num:'090/196', sortKey:90,  rarity:'common',    type:'Fighting',  hp:120, price:0.05, img:IMG.s11(90)  },
  '091': { id:'091', name:'Rhyperior',           num:'091/196', sortKey:91,  rarity:'uncommon',  type:'Fighting',  hp:190, price:0.15, img:IMG.s11(91)  },
  '092': { id:'092', name:'Aerodactyl V',        num:'092/196', sortKey:92,  rarity:'v',         type:'Fighting',  hp:210, price:2.00, img:IMG.s11(92)  },
  '093': { id:'093', name:'Aerodactyl VSTAR',    num:'093/196', sortKey:93,  rarity:'vstar',     type:'Fighting',  hp:260, price:4.00, img:IMG.s11(93)  },
  '094': { id:'094', name:'Sudowoodo',           num:'094/196', sortKey:94,  rarity:'common',    type:'Fighting',  hp:110, price:0.06, img:IMG.s11(94)  },
  '095': { id:'095', name:'Gligar',              num:'095/196', sortKey:95,  rarity:'common',    type:'Fighting',  hp:60,  price:0.05, img:IMG.s11(95)  },
  '096': { id:'096', name:'Gliscor',             num:'096/196', sortKey:96,  rarity:'uncommon',  type:'Fighting',  hp:120, price:0.12, img:IMG.s11(96)  },
  '097': { id:'097', name:'Makuhita',            num:'097/196', sortKey:97,  rarity:'common',    type:'Fighting',  hp:80,  price:0.05, img:IMG.s11(97)  },
  '098': { id:'098', name:'Hariyama',            num:'098/196', sortKey:98,  rarity:'uncommon',  type:'Fighting',  hp:140, price:0.10, img:IMG.s11(98)  },
  '099': { id:'099', name:'Meditite',            num:'099/196', sortKey:99,  rarity:'common',    type:'Fighting',  hp:70,  price:0.06, img:IMG.s11(99)  },
  '100': { id:'100', name:'Medicham',            num:'100/196', sortKey:100, rarity:'uncommon',  type:'Fighting',  hp:110, price:0.12, img:IMG.s11(100) },
  '101': { id:'101', name:'Relicanth',           num:'101/196', sortKey:101, rarity:'uncommon',  type:'Fighting',  hp:90,  price:0.12, img:IMG.s11(101) },
  '102': { id:'102', name:'Gastrodon',           num:'102/196', sortKey:102, rarity:'common',    type:'Fighting',  hp:130, price:0.06, img:IMG.s11(102) },
  '103': { id:'103', name:'Mienfoo',             num:'103/196', sortKey:103, rarity:'common',    type:'Fighting',  hp:60,  price:0.05, img:IMG.s11(103) },
  '104': { id:'104', name:'Mienshao',            num:'104/196', sortKey:104, rarity:'uncommon',  type:'Fighting',  hp:90,  price:0.15, img:IMG.s11(104) },
  '105': { id:'105', name:'Landorus',            num:'105/196', sortKey:105, rarity:'holo-rare', type:'Fighting',  hp:120, price:1.00, img:IMG.s11(105) },
  '106': { id:'106', name:'Binacle',             num:'106/196', sortKey:106, rarity:'common',    type:'Fighting',  hp:70,  price:0.05, img:IMG.s11(106) },
  '107': { id:'107', name:'Barbaracle',          num:'107/196', sortKey:107, rarity:'holo-rare', type:'Fighting',  hp:130, price:1.00, img:IMG.s11(107) },
  '108': { id:'108', name:'Carbink',             num:'108/196', sortKey:108, rarity:'common',    type:'Fighting',  hp:90,  price:0.06, img:IMG.s11(108) },
  '109': { id:'109', name:'Rockruff',            num:'109/196', sortKey:109, rarity:'common',    type:'Fighting',  hp:60,  price:0.06, img:IMG.s11(109) },
  '110': { id:'110', name:'Falinks',             num:'110/196', sortKey:110, rarity:'common',    type:'Fighting',  hp:100, price:0.05, img:IMG.s11(110) },
  '111': { id:'111', name:'Stonjourner',         num:'111/196', sortKey:111, rarity:'uncommon',  type:'Fighting',  hp:140, price:0.12, img:IMG.s11(111) },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 7 — DARKNESS (112–123)
  // ═══════════════════════════════════════════════════════════════
  '112': { id:'112', name:'Spinarak',            num:'112/196', sortKey:112, rarity:'common',    type:'Darkness',  hp:50,  price:0.05, img:IMG.s11(112) },
  '113': { id:'113', name:'Ariados',             num:'113/196', sortKey:113, rarity:'uncommon',  type:'Darkness',  hp:90,  price:0.15, img:IMG.s11(113) },
  '114': { id:'114', name:'Murkrow',             num:'114/196', sortKey:114, rarity:'common',    type:'Darkness',  hp:60,  price:0.06, img:IMG.s11(114) },
  '115': { id:'115', name:'Honchkrow',           num:'115/196', sortKey:115, rarity:'rare',      type:'Darkness',  hp:120, price:0.50, img:IMG.s11(115) },
  '116': { id:'116', name:'Seviper',             num:'116/196', sortKey:116, rarity:'uncommon',  type:'Darkness',  hp:110, price:0.12, img:IMG.s11(116) },
  '117': { id:'117', name:'Spiritomb',           num:'117/196', sortKey:117, rarity:'uncommon',  type:'Darkness',  hp:60,  price:0.20, img:IMG.s11(117) },
  '118': { id:'118', name:'Drapion V',           num:'118/196', sortKey:118, rarity:'v',         type:'Darkness',  hp:210, price:1.50, img:IMG.s11(118) },
  '119': { id:'119', name:'Drapion VSTAR',       num:'119/196', sortKey:119, rarity:'vstar',     type:'Darkness',  hp:270, price:3.00, img:IMG.s11(119) },
  '120': { id:'120', name:'Darkrai',             num:'120/196', sortKey:120, rarity:'holo-rare', type:'Darkness',  hp:120, price:1.50, img:IMG.s11(120) },
  '121': { id:'121', name:'Inkay',               num:'121/196', sortKey:121, rarity:'common',    type:'Darkness',  hp:50,  price:0.05, img:IMG.s11(121) },
  '122': { id:'122', name:'Hoopa',               num:'122/196', sortKey:122, rarity:'uncommon',  type:'Darkness',  hp:120, price:0.20, img:IMG.s11(122) },
  '123': { id:'123', name:'Radiant Hisuian Sneasler', num:'123/196', sortKey:123, rarity:'radiant-rare', type:'Darkness', hp:130, price:4.00, img:IMG.s11(123) },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 8 — METAL (124–129)
  // ═══════════════════════════════════════════════════════════════
  '124': { id:'124', name:'Radiant Steelix',     num:'124/196', sortKey:124, rarity:'radiant-rare', type:'Metal',  hp:170, price:3.00, img:IMG.s11(124) },
  '125': { id:'125', name:'Bronzor',             num:'125/196', sortKey:125, rarity:'common',    type:'Metal',     hp:70,  price:0.05, img:IMG.s11(125) },
  '126': { id:'126', name:'Bronzong',            num:'126/196', sortKey:126, rarity:'uncommon',  type:'Metal',     hp:130, price:0.15, img:IMG.s11(126) },
  '127': { id:'127', name:'Galarian Stunfisk',   num:'127/196', sortKey:127, rarity:'uncommon',  type:'Metal',     hp:100, price:0.12, img:IMG.s11(127) },
  '128': { id:'128', name:'Magearna',            num:'128/196', sortKey:128, rarity:'uncommon',  type:'Metal',     hp:90,  price:0.12, img:IMG.s11(128) },
  '129': { id:'129', name:'Galarian Perrserker V', num:'129/196', sortKey:129, rarity:'v',       type:'Metal',     hp:200, price:1.00, img:IMG.s11(129) },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 9 — DRAGON (130–136)
  // ═══════════════════════════════════════════════════════════════
  '130': { id:'130', name:'Giratina V',          num:'130/196', sortKey:130, rarity:'v',         type:'Dragon',    hp:220, price:5.00, img:IMG.s11(130) },
  '131': { id:'131', name:'Giratina VSTAR',      num:'131/196', sortKey:131, rarity:'vstar',     type:'Dragon',    hp:280, price:15.00,img:IMG.s11(131) },
  '132': { id:'132', name:'Goomy',               num:'132/196', sortKey:132, rarity:'common',    type:'Dragon',    hp:60,  price:0.08, img:IMG.s11(132) },
  '133': { id:'133', name:'Hisuian Sliggoo',     num:'133/196', sortKey:133, rarity:'uncommon',  type:'Dragon',    hp:90,  price:0.12, img:IMG.s11(133) },
  '134': { id:'134', name:'Hisuian Goodra',      num:'134/196', sortKey:134, rarity:'holo-rare', type:'Dragon',    hp:160, price:1.25, img:IMG.s11(134) },
  '135': { id:'135', name:'Hisuian Goodra V',    num:'135/196', sortKey:135, rarity:'v',         type:'Dragon',    hp:220, price:1.50, img:IMG.s11(135) },
  '136': { id:'136', name:'Hisuian Goodra VSTAR',num:'136/196', sortKey:136, rarity:'vstar',     type:'Dragon',    hp:270, price:3.00, img:IMG.s11(136) },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 10 — COLORLESS (137–151)
  // ═══════════════════════════════════════════════════════════════
  '137': { id:'137', name:'Pidgeot V',           num:'137/196', sortKey:137, rarity:'v',         type:'Colorless', hp:210, price:1.50, img:IMG.s11(137) },
  '138': { id:'138', name:'Lickitung',           num:'138/196', sortKey:138, rarity:'common',    type:'Colorless', hp:110, price:0.06, img:IMG.s11(138) },
  '139': { id:'139', name:'Lickilicky',          num:'139/196', sortKey:139, rarity:'common',    type:'Colorless', hp:140, price:0.06, img:IMG.s11(139) },
  '140': { id:'140', name:'Porygon',             num:'140/196', sortKey:140, rarity:'common',    type:'Colorless', hp:60,  price:0.06, img:IMG.s11(140) },
  '141': { id:'141', name:'Porygon2',            num:'141/196', sortKey:141, rarity:'uncommon',  type:'Colorless', hp:90,  price:0.15, img:IMG.s11(141) },
  '142': { id:'142', name:'Porygon-Z',           num:'142/196', sortKey:142, rarity:'uncommon',  type:'Colorless', hp:150, price:0.75, img:IMG.s11(142) },
  '143': { id:'143', name:'Snorlax',             num:'143/196', sortKey:143, rarity:'holo-rare', type:'Colorless', hp:150, price:1.50, img:IMG.s11(143) },
  '144': { id:'144', name:'Aipom',               num:'144/196', sortKey:144, rarity:'common',    type:'Colorless', hp:60,  price:0.05, img:IMG.s11(144) },
  '145': { id:'145', name:'Ambipom',             num:'145/196', sortKey:145, rarity:'uncommon',  type:'Colorless', hp:90,  price:0.12, img:IMG.s11(145) },
  '146': { id:'146', name:'Hisuian Zoroark V',   num:'146/196', sortKey:146, rarity:'v',         type:'Colorless', hp:210, price:3.00, img:IMG.s11(146) },
  '147': { id:'147', name:'Hisuian Zoroark VSTAR',num:'147/196', sortKey:147, rarity:'vstar',   type:'Colorless', hp:270, price:10.00,img:IMG.s11(147) },
  '148': { id:'148', name:'Bouffalant',          num:'148/196', sortKey:148, rarity:'uncommon',  type:'Colorless', hp:130, price:0.12, img:IMG.s11(148) },
  '149': { id:'149', name:'Komala',              num:'149/196', sortKey:149, rarity:'common',    type:'Colorless', hp:100, price:0.06, img:IMG.s11(149) },
  '150': { id:'150', name:'Skwovet',             num:'150/196', sortKey:150, rarity:'common',    type:'Colorless', hp:60,  price:0.05, img:IMG.s11(150) },
  '151': { id:'151', name:'Greedent',            num:'151/196', sortKey:151, rarity:'uncommon',  type:'Colorless', hp:130, price:0.12, img:IMG.s11(151) },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 11 — TRAINERS & ENERGY (152–171)
  // ═══════════════════════════════════════════════════════════════
  '152': { id:'152', name:'Arc Phone',           num:'152/196', sortKey:152, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.25, img:IMG.s11(152), isTrainer:true },
  '153': { id:'153', name:'Arezu',               num:'153/196', sortKey:153, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.30, img:IMG.s11(153), isTrainer:true, isSupporter:true },
  '154': { id:'154', name:'Box of Disaster',     num:'154/196', sortKey:154, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.50, img:IMG.s11(154), isTrainer:true, isTool:true },
  '155': { id:'155', name:"Colress's Experiment",num:'155/196', sortKey:155, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.50, img:IMG.s11(155), isTrainer:true, isSupporter:true },
  '156': { id:'156', name:'Damage Pump',         num:'156/196', sortKey:156, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.20, img:IMG.s11(156), isTrainer:true },
  '157': { id:'157', name:'Fantina',             num:'157/196', sortKey:157, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.25, img:IMG.s11(157), isTrainer:true, isSupporter:true },
  '158': { id:'158', name:'Iscan',               num:'158/196', sortKey:158, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.20, img:IMG.s11(158), isTrainer:true, isSupporter:true },
  '159': { id:'159', name:'Lady',                num:'159/196', sortKey:159, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.20, img:IMG.s11(159), isTrainer:true, isSupporter:true },
  '160': { id:'160', name:'Lake Acuity',         num:'160/196', sortKey:160, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.25, img:IMG.s11(160), isTrainer:true, isStadium:true },
  '161': { id:'161', name:'Lost City',           num:'161/196', sortKey:161, rarity:'rare',      type:'Trainer',   hp:null, price:1.25, img:IMG.s11(161), isTrainer:true, isStadium:true },
  '162': { id:'162', name:'Lost Vacuum',         num:'162/196', sortKey:162, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.30, img:IMG.s11(162), isTrainer:true },
  '163': { id:'163', name:'Mirage Gate',         num:'163/196', sortKey:163, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.75, img:IMG.s11(163), isTrainer:true },
  '164': { id:'164', name:'Miss Fortune Sisters',num:'164/196', sortKey:164, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.25, img:IMG.s11(164), isTrainer:true, isSupporter:true },
  '165': { id:'165', name:'Panic Mask',          num:'165/196', sortKey:165, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.20, img:IMG.s11(165), isTrainer:true, isTool:true },
  '166': { id:'166', name:'Riley',               num:'166/196', sortKey:166, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.25, img:IMG.s11(166), isTrainer:true, isSupporter:true },
  '167': { id:'167', name:'Thorton',             num:'167/196', sortKey:167, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.25, img:IMG.s11(167), isTrainer:true, isSupporter:true },
  '168': { id:'168', name:'Tool Box',            num:'168/196', sortKey:168, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.20, img:IMG.s11(168), isTrainer:true },
  '169': { id:'169', name:'Volo',                num:'169/196', sortKey:169, rarity:'holo-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(169), isTrainer:true, isSupporter:true },
  '170': { id:'170', name:'Windup Arm',          num:'170/196', sortKey:170, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.20, img:IMG.s11(170), isTrainer:true, isTool:true },
  '171': { id:'171', name:'Gift Energy',         num:'171/196', sortKey:171, rarity:'uncommon',  type:'Trainer',   hp:null, price:0.50, img:IMG.s11(171), isTrainer:true, isEnergy:true },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 12 — ULTRA RARES / FULL ARTS (172–196)
  //   172–188 = Full Art Pokémon V
  //   189–196 = Full Art Supporters
  // ═══════════════════════════════════════════════════════════════
  '172': { id:'172', name:'Hisuian Electrode V', num:'172/196', sortKey:172, rarity:'ultra-rare', type:'Lightning', hp:210, price:3.00, img:IMG.s11(172) },
  '173': { id:'173', name:'Delphox V',           num:'173/196', sortKey:173, rarity:'ultra-rare', type:'Fire',      hp:210, price:3.00, img:IMG.s11(173) },
  '174': { id:'174', name:'Kyurem V',            num:'174/196', sortKey:174, rarity:'ultra-rare', type:'Water',     hp:220, price:5.00, img:IMG.s11(174) },
  '175': { id:'175', name:'Magnezone V',         num:'175/196', sortKey:175, rarity:'ultra-rare', type:'Lightning', hp:210, price:4.00, img:IMG.s11(175) },
  '176': { id:'176', name:'Rotom V',             num:'176/196', sortKey:176, rarity:'ultra-rare', type:'Lightning', hp:190, price:4.00, img:IMG.s11(176) },
  '177': { id:'177', name:'Rotom V',             num:'177/196', sortKey:177, rarity:'ultra-rare', type:'Lightning', hp:190, price:27.00,img:IMG.s11(177), altArt:true },
  '178': { id:'178', name:'Aerodactyl V',        num:'178/196', sortKey:178, rarity:'ultra-rare', type:'Fighting',  hp:210, price:5.00, img:IMG.s11(178) },
  '179': { id:'179', name:'Aerodactyl V',        num:'179/196', sortKey:179, rarity:'ultra-rare', type:'Fighting',  hp:210, price:136.00,img:IMG.s11(179), altArt:true },
  '180': { id:'180', name:'Gallade V',           num:'180/196', sortKey:180, rarity:'ultra-rare', type:'Psychic',   hp:220, price:4.00, img:IMG.s11(180) },
  '181': { id:'181', name:'Gallade V',           num:'181/196', sortKey:181, rarity:'ultra-rare', type:'Psychic',   hp:220, price:4.00, img:IMG.s11(181), altArt:true },
  '182': { id:'182', name:'Drapion V',           num:'182/196', sortKey:182, rarity:'ultra-rare', type:'Darkness',  hp:210, price:3.00, img:IMG.s11(182) },
  '183': { id:'183', name:'Galarian Perrserker V',num:'183/196',sortKey:183, rarity:'ultra-rare', type:'Metal',     hp:200, price:3.00, img:IMG.s11(183) },
  '184': { id:'184', name:'Galarian Perrserker V',num:'184/196',sortKey:184, rarity:'ultra-rare', type:'Metal',     hp:200, price:16.00,img:IMG.s11(184), altArt:true },
  '185': { id:'185', name:'Giratina V',          num:'185/196', sortKey:185, rarity:'ultra-rare', type:'Dragon',    hp:220, price:8.00, img:IMG.s11(185) },
  '186': { id:'186', name:'Giratina V',          num:'186/196', sortKey:186, rarity:'ultra-rare', type:'Dragon',    hp:220, price:560.00,img:IMG.s11(186), altArt:true },
  '187': { id:'187', name:'Hisuian Goodra V',    num:'187/196', sortKey:187, rarity:'ultra-rare', type:'Dragon',    hp:220, price:3.00, img:IMG.s11(187) },
  '188': { id:'188', name:'Pidgeot V',           num:'188/196', sortKey:188, rarity:'ultra-rare', type:'Colorless', hp:210, price:3.00, img:IMG.s11(188) },
  // Full Art Supporters
  '189': { id:'189', name:'Arezu',               num:'189/196', sortKey:189, rarity:'ultra-rare', type:'Trainer',   hp:null, price:3.50, img:IMG.s11(189), isTrainer:true, isSupporter:true },
  '190': { id:'190', name:"Colress's Experiment",num:'190/196', sortKey:190, rarity:'ultra-rare', type:'Trainer',   hp:null, price:5.00, img:IMG.s11(190), isTrainer:true, isSupporter:true },
  '191': { id:'191', name:'Fantina',             num:'191/196', sortKey:191, rarity:'ultra-rare', type:'Trainer',   hp:null, price:4.00, img:IMG.s11(191), isTrainer:true, isSupporter:true },
  '192': { id:'192', name:'Iscan',               num:'192/196', sortKey:192, rarity:'ultra-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(192), isTrainer:true, isSupporter:true },
  '193': { id:'193', name:'Lady',                num:'193/196', sortKey:193, rarity:'ultra-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(193), isTrainer:true, isSupporter:true },
  '194': { id:'194', name:'Miss Fortune Sisters',num:'194/196', sortKey:194, rarity:'ultra-rare', type:'Trainer',   hp:null, price:3.50, img:IMG.s11(194), isTrainer:true, isSupporter:true },
  '195': { id:'195', name:'Thorton',             num:'195/196', sortKey:195, rarity:'ultra-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(195), isTrainer:true, isSupporter:true },
  '196': { id:'196', name:'Volo',                num:'196/196', sortKey:196, rarity:'ultra-rare', type:'Trainer',   hp:null, price:5.00, img:IMG.s11(196), isTrainer:true, isSupporter:true },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 13 — RAINBOW RARES (197–211)
  //   These are Rainbow Rare versions of VSTARs and Supporters
  // ═══════════════════════════════════════════════════════════════
  '197': { id:'197', name:'Kyurem VMAX',          num:'197/196', sortKey:197, rarity:'rainbow-rare', type:'Water',     hp:330, price:8.00, img:IMG.s11(197) },
  '198': { id:'198', name:'Magnezone VSTAR',       num:'198/196', sortKey:198, rarity:'rainbow-rare', type:'Lightning', hp:270, price:5.00, img:IMG.s11(198) },
  '199': { id:'199', name:'Aerodactyl VSTAR',      num:'199/196', sortKey:199, rarity:'rainbow-rare', type:'Fighting',  hp:260, price:8.25, img:IMG.s11(199) },
  '200': { id:'200', name:'Drapion VSTAR',         num:'200/196', sortKey:200, rarity:'rainbow-rare', type:'Darkness',  hp:270, price:5.00, img:IMG.s11(200) },
  '201': { id:'201', name:'Giratina VSTAR',        num:'201/196', sortKey:201, rarity:'rainbow-rare', type:'Dragon',    hp:280, price:21.75,img:IMG.s11(201) },
  '202': { id:'202', name:'Hisuian Goodra VSTAR',  num:'202/196', sortKey:202, rarity:'rainbow-rare', type:'Dragon',    hp:270, price:6.00, img:IMG.s11(202) },
  '203': { id:'203', name:'Hisuian Zoroark VSTAR', num:'203/196', sortKey:203, rarity:'rainbow-rare', type:'Colorless', hp:270, price:15.00,img:IMG.s11(203) },
  '204': { id:'204', name:'Arezu',                 num:'204/196', sortKey:204, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(204), isTrainer:true, isSupporter:true },
  '205': { id:'205', name:"Colress's Experiment",  num:'205/196', sortKey:205, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:4.50, img:IMG.s11(205), isTrainer:true, isSupporter:true },
  '206': { id:'206', name:'Fantina',               num:'206/196', sortKey:206, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(206), isTrainer:true, isSupporter:true },
  '207': { id:'207', name:'Iscan',                 num:'207/196', sortKey:207, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(207), isTrainer:true, isSupporter:true },
  '208': { id:'208', name:'Lady',                  num:'208/196', sortKey:208, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(208), isTrainer:true, isSupporter:true },
  '209': { id:'209', name:'Miss Fortune Sisters',  num:'209/196', sortKey:209, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(209), isTrainer:true, isSupporter:true },
  '210': { id:'210', name:'Thorton',               num:'210/196', sortKey:210, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:3.00, img:IMG.s11(210), isTrainer:true, isSupporter:true },
  '211': { id:'211', name:'Volo',                  num:'211/196', sortKey:211, rarity:'rainbow-rare', type:'Trainer',   hp:null, price:4.00, img:IMG.s11(211), isTrainer:true, isSupporter:true },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 14 — GOLD SECRET RARES (212–217)
  // ═══════════════════════════════════════════════════════════════
  '212': { id:'212', name:'Giratina VSTAR',       num:'212/196', sortKey:212, rarity:'secret-rare', type:'Dragon',  hp:280, price:9.50,  img:IMG.s11(212) },
  '213': { id:'213', name:'Hisuian Zoroark VSTAR',num:'213/196', sortKey:213, rarity:'secret-rare', type:'Colorless',hp:270,price:7.00,  img:IMG.s11(213) },
  '214': { id:'214', name:'Box of Disaster',      num:'214/196', sortKey:214, rarity:'secret-rare', type:'Trainer', hp:null, price:5.00, img:IMG.s11(214), isTrainer:true, isTool:true },
  '215': { id:'215', name:'Collapsed Stadium',    num:'215/196', sortKey:215, rarity:'secret-rare', type:'Trainer', hp:null, price:5.00, img:IMG.s11(215), isTrainer:true, isStadium:true },
  '216': { id:'216', name:'Dark Patch',           num:'216/196', sortKey:216, rarity:'secret-rare', type:'Trainer', hp:null, price:6.00, img:IMG.s11(216), isTrainer:true },
  '217': { id:'217', name:'Lost Vacuum',          num:'217/196', sortKey:217, rarity:'secret-rare', type:'Trainer', hp:null, price:5.00, img:IMG.s11(217), isTrainer:true },

  // ═══════════════════════════════════════════════════════════════
  // SECTION 15 — TRAINER GALLERY (TG01–TG30)
  //   TG01–TG11  = Character Rare Holo (basic & stage Pokémon)
  //   TG12–TG22  = Character Super Rare (V / VMAX cards)
  //   TG23–TG28  = Full Art Supporter Ultra Rare
  //   TG29–TG30  = Special Illustration Rare (highest tier)
  // ═══════════════════════════════════════════════════════════════
  'TG01': { id:'TG01', name:'Parasect',             num:'TG01/TG30', sortKey:301, rarity:'trainer-gallery',      type:'Grass',     hp:120, price:3.40,  img:IMG.tg('TG01') },
  'TG02': { id:'TG02', name:'Roserade',             num:'TG02/TG30', sortKey:302, rarity:'trainer-gallery',      type:'Grass',     hp:120, price:2.58,  img:IMG.tg('TG02') },
  'TG03': { id:'TG03', name:'Charizard',            num:'TG03/TG30', sortKey:303, rarity:'trainer-gallery',      type:'Fire',      hp:170, price:11.09, img:IMG.tg('TG03') },
  'TG04': { id:'TG04', name:'Chandelure',           num:'TG04/TG30', sortKey:304, rarity:'trainer-gallery',      type:'Fire',      hp:150, price:3.21,  img:IMG.tg('TG04') },
  'TG05': { id:'TG05', name:'Pikachu',              num:'TG05/TG30', sortKey:305, rarity:'trainer-gallery',      type:'Lightning', hp:60,  price:13.57, img:IMG.tg('TG05') },
  'TG06': { id:'TG06', name:'Gengar',               num:'TG06/TG30', sortKey:306, rarity:'trainer-gallery',      type:'Psychic',   hp:120, price:14.84, img:IMG.tg('TG06') },
  'TG07': { id:'TG07', name:'Banette',              num:'TG07/TG30', sortKey:307, rarity:'trainer-gallery',      type:'Psychic',   hp:80,  price:3.11,  img:IMG.tg('TG07') },
  'TG08': { id:'TG08', name:'Hisuian Arcanine',     num:'TG08/TG30', sortKey:308, rarity:'trainer-gallery',      type:'Fire',      hp:130, price:5.07,  img:IMG.tg('TG08') },
  'TG09': { id:'TG09', name:'Spiritomb',            num:'TG09/TG30', sortKey:309, rarity:'trainer-gallery',      type:'Darkness',  hp:60,  price:3.10,  img:IMG.tg('TG09') },
  'TG10': { id:'TG10', name:'Snorlax',              num:'TG10/TG30', sortKey:310, rarity:'trainer-gallery',      type:'Colorless', hp:150, price:24.00, img:IMG.tg('TG10') },
  'TG11': { id:'TG11', name:'Castform',             num:'TG11/TG30', sortKey:311, rarity:'trainer-gallery',      type:'Colorless', hp:70,  price:2.23,  img:IMG.tg('TG11') },
  'TG12': { id:'TG12', name:'Orbeetle V',           num:'TG12/TG30', sortKey:312, rarity:'trainer-gallery-v',    type:'Psychic',   hp:180, price:5.33,  img:IMG.tg('TG12') },
  'TG13': { id:'TG13', name:'Orbeetle VMAX',        num:'TG13/TG30', sortKey:313, rarity:'trainer-gallery-vmax', type:'Psychic',   hp:310, price:10.58, img:IMG.tg('TG13') },
  'TG14': { id:'TG14', name:'Centiskorch V',        num:'TG14/TG30', sortKey:314, rarity:'trainer-gallery-v',    type:'Fire',      hp:210, price:4.17,  img:IMG.tg('TG14') },
  'TG15': { id:'TG15', name:'Centiskorch VMAX',     num:'TG15/TG30', sortKey:315, rarity:'trainer-gallery-vmax', type:'Fire',      hp:320, price:7.79,  img:IMG.tg('TG15') },
  'TG16': { id:'TG16', name:'Pikachu V',            num:'TG16/TG30', sortKey:316, rarity:'trainer-gallery-v',    type:'Lightning', hp:190, price:45.31, img:IMG.tg('TG16') },
  'TG17': { id:'TG17', name:'Pikachu VMAX',         num:'TG17/TG30', sortKey:317, rarity:'trainer-gallery-vmax', type:'Lightning', hp:310, price:57.28, img:IMG.tg('TG17') },
  'TG18': { id:'TG18', name:'Enamorus V',           num:'TG18/TG30', sortKey:318, rarity:'trainer-gallery-v',    type:'Psychic',   hp:210, price:10.24, img:IMG.tg('TG18') },
  'TG19': { id:'TG19', name:'Gallade V',            num:'TG19/TG30', sortKey:319, rarity:'trainer-gallery-v',    type:'Psychic',   hp:220, price:9.99,  img:IMG.tg('TG19') },
  'TG20': { id:'TG20', name:'Crobat V',             num:'TG20/TG30', sortKey:320, rarity:'trainer-gallery-v',    type:'Darkness',  hp:180, price:11.55, img:IMG.tg('TG20') },
  'TG21': { id:'TG21', name:'Eternatus V',          num:'TG21/TG30', sortKey:321, rarity:'trainer-gallery-v',    type:'Darkness',  hp:220, price:5.20,  img:IMG.tg('TG21') },
  'TG22': { id:'TG22', name:'Eternatus VMAX',       num:'TG22/TG30', sortKey:322, rarity:'trainer-gallery-vmax', type:'Darkness',  hp:340, price:11.59, img:IMG.tg('TG22') },
  'TG23': { id:'TG23', name:"Adventurer's Discovery",num:'TG23/TG30',sortKey:323, rarity:'trainer-gallery-ultra',type:'Trainer',  hp:null, price:3.84,  img:IMG.tg('TG23'), isTrainer:true, isSupporter:true },
  'TG24': { id:'TG24', name:"Boss's Orders",        num:'TG24/TG30', sortKey:324, rarity:'trainer-gallery-ultra',type:'Trainer',  hp:null, price:9.84,  img:IMG.tg('TG24'), isTrainer:true, isSupporter:true },
  'TG25': { id:'TG25', name:'Cook',                 num:'TG25/TG30', sortKey:325, rarity:'trainer-gallery-ultra',type:'Trainer',  hp:null, price:2.97,  img:IMG.tg('TG25'), isTrainer:true, isSupporter:true },
  'TG26': { id:'TG26', name:'Kabu',                 num:'TG26/TG30', sortKey:326, rarity:'trainer-gallery-ultra',type:'Trainer',  hp:null, price:1.69,  img:IMG.tg('TG26'), isTrainer:true, isSupporter:true },
  'TG27': { id:'TG27', name:'Nessa',                num:'TG27/TG30', sortKey:327, rarity:'trainer-gallery-ultra',type:'Trainer',  hp:null, price:11.20, img:IMG.tg('TG27'), isTrainer:true, isSupporter:true },
  'TG28': { id:'TG28', name:'Opal',                 num:'TG28/TG30', sortKey:328, rarity:'trainer-gallery-ultra',type:'Trainer',  hp:null, price:2.37,  img:IMG.tg('TG28'), isTrainer:true, isSupporter:true },
  'TG29': { id:'TG29', name:'Pikachu VMAX',         num:'TG29/TG30', sortKey:329, rarity:'special-illustration-rare', type:'Lightning', hp:310, price:26.30, img:IMG.tg('TG29') },
  'TG30': { id:'TG30', name:'Mew VMAX',             num:'TG30/TG30', sortKey:330, rarity:'special-illustration-rare', type:'Psychic',   hp:310, price:32.83, img:IMG.tg('TG30') },
};

// Add sell values
Object.values(CARDS).forEach(c => { c.sell = sellTokens(c.price); });

// ── POOL HELPERS ─────────────────────────────────────────────────
// Pull card IDs by rarity
function cardsByRarity(...rarities) {
  return Object.keys(CARDS).filter(k => rarities.includes(CARDS[k].rarity));
}

// ── PACK POOLS ───────────────────────────────────────────────────
const POOL = {
  common:   cardsByRarity('common'),
  uncommon: cardsByRarity('uncommon'),
  rare:     cardsByRarity('rare'),
  holoRare: cardsByRarity('holo-rare'),
  radiant:  cardsByRarity('radiant-rare'),
  v:        cardsByRarity('v'),
  vmax:     cardsByRarity('vmax'),
  vstar:    cardsByRarity('vstar'),
  // Ultra Rares = Full Art V (not alt art flagged) — 172–188 excl. alt arts
  ultraRare: ['172','173','174','175','176','178','180','182','183','185','187','188'],
  // Alt Arts (high-value illustration rares) — flagged with altArt:true
  altArt:   ['177','179','181','184','186'],
  rainbow:  cardsByRarity('rainbow-rare'),
  gold:     cardsByRarity('secret-rare'),
  // Full Art Supporters
  faSupporter: ['189','190','191','192','193','194','195','196'],
  // Trainer Gallery tiers
  tgHolo:   ['TG01','TG02','TG03','TG04','TG05','TG06','TG07','TG08','TG09','TG10','TG11'],
  tgV:      ['TG12','TG13','TG14','TG15','TG16','TG17','TG18','TG19','TG20','TG21','TG22'],
  tgUltra:  ['TG23','TG24','TG25','TG26','TG27','TG28'],
  sir:      ['TG29','TG30'],
};

function pick(pool) { return { ...CARDS[pool[Math.floor(Math.random() * pool.length)]] }; }

function generatePack() {
  const pack = [];

  // 5 commons
  for (let i = 0; i < 5; i++) pack.push(pick(POOL.common));

  // 3 uncommons
  for (let i = 0; i < 3; i++) pack.push(pick(POOL.uncommon));

  // ── RARE+ SLOT ────────────────────────────────────────────────
  const r = Math.random();
  let hit;
  if      (r < 0.004) hit = pick(POOL.sir);         // 0.4%  TG29-30 SIR
  else if (r < 0.010) hit = pick(POOL.altArt);      // 0.6%  Alt Art V
  else if (r < 0.020) hit = pick(POOL.rainbow);     // 1.0%  Rainbow Rare
  else if (r < 0.032) hit = pick(POOL.gold);        // 1.2%  Gold Secret Rare
  else if (r < 0.044) hit = pick(POOL.faSupporter); // 1.2%  Full Art Supporter
  else if (r < 0.060) hit = pick(POOL.ultraRare);   // 1.6%  Full Art V
  else if (r < 0.080) hit = pick(POOL.radiant);     // 2.0%  Radiant Rare
  else if (r < 0.160) hit = pick([...POOL.vstar, ...POOL.vmax]); // 8.0% VSTAR/VMAX
  else if (r < 0.340) hit = pick(POOL.v);           // 18.0% Pokémon V
  else                hit = pick(POOL.holoRare);    // 66.0% Holo Rare

  pack.push(hit);

  // ── FOIL SLOT (TG or Reverse Holo) ────────────────────────────
  const f = Math.random();
  let foil;
  if (f < 0.04) {
    foil = pick(POOL.tgUltra);   // 4%  TG Full Art Supporter
  } else if (f < 0.12) {
    foil = pick(POOL.tgV);       // 8%  TG V / VMAX
  } else if (f < 0.24) {
    foil = pick(POOL.tgHolo);    // 12% TG Character Rare Holo
  } else {
    // 76% Reverse Holo (any non-holo card with reverse treatment)
    const base = pick([...POOL.common, ...POOL.uncommon, ...POOL.rare]);
    foil = { ...base, rarity:'reverse-holo', baseRarity:base.rarity,
             sell: Math.max(2, base.sell * 2) };
  }
  pack.push(foil);

  return pack;
}
