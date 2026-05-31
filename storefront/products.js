/* FILTER SUPPLY — shared sample catalogue (fake, on-brand).
   Japanese-primary. Plain script: sets window.FS_PRODUCTS.
   `jp` is the primary name, `en` is the small romaji/English texture.
   `cat` drives filtering; the *Jp fields are for display. */
window.FS_PRODUCTS = [
  { id: "morning", cat: "blend", jp: "モーニングブレンド", en: "Morning Blend",
    origin: "ブレンド", originEn: "Blend", process: "ウォッシュト・ナチュラル",
    roast: "中煎り", roastEn: "Medium", weight: "200g", price: 1800,
    notes: "穏やかでバランスのよい一杯。ミルクチョコレート、アーモンド、やわらかな柑橘の余韻。一日のはじまりに。", kanji: "朝", img: "jar.jpeg" },
  { id: "night", cat: "blend", jp: "ナイトブレンド", en: "Night Blend",
    origin: "ブレンド", originEn: "Blend", process: "ナチュラル",
    roast: "深煎り", roastEn: "Dark", weight: "200g", price: 1900,
    notes: "深く、静かな味わい。ダークカカオ、ドライフィグ、黒糖。一日の終わりに。", kanji: "夜", img: "jar.jpeg" },
  { id: "yirgacheffe", cat: "single", jp: "エチオピア イルガチェフェ", en: "Ethiopia Yirgacheffe",
    origin: "エチオピア", originEn: "Ethiopia", process: "ウォッシュト",
    roast: "浅煎り", roastEn: "Light", weight: "200g", price: 2200,
    notes: "ベルガモット、白桃、紅茶。華やかで澄んだ味わい。", kanji: "花", img: "jar.jpeg" },
  { id: "antigua", cat: "single", jp: "グアテマラ アンティグア", en: "Guatemala Antigua",
    origin: "グアテマラ", originEn: "Guatemala", process: "ウォッシュト",
    roast: "中煎り", roastEn: "Medium", weight: "200g", price: 2000,
    notes: "カカオ、赤りんご、まろやかなキャラメルの甘み。", kanji: "実", img: "jar.jpeg" },
  { id: "nyeri", cat: "single", jp: "ケニア ニエリ", en: "Kenya Nyeri",
    origin: "ケニア", originEn: "Kenya", process: "ウォッシュト",
    roast: "浅煎り", roastEn: "Light", weight: "200g", price: 2300,
    notes: "カシス、トマト、明るく、芯のある酸。", kanji: "赤", img: "jar.jpeg" },
  { id: "v60", cat: "equipment", jp: "セラミックドリッパー", en: "Ceramic Dripper",
    origin: "器具", originEn: "Equipment", process: "磁器・有田焼",
    roast: "—", roastEn: "—", weight: "01", price: 3200,
    notes: "一杯ずつ淹れるための円すい型ドリッパー。有田の磁器で仕上げました。", kanji: "器" },
];
