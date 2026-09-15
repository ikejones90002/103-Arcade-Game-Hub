/* NumBuzz Math World — curriculum data */
(function (global) {
  "use strict";

  function lesson(id, title, skillTags, activities, reward) {
    return { id: id, title: title, skillTags: skillTags, activities: activities, reward: reward || { xp: 15, stars: 1 } };
  }

  function eq(prompt, speak, answer, skill, options) {
    const act = {
      type: options ? "choice" : "equation",
      prompt: prompt,
      speak: speak || prompt,
      answer: String(answer),
      skill: skill,
      payload: { equation: prompt }
    };
    if (options) act.options = options.map(String);
    return act;
  }

  function makeAddFacts(max, count, skill) {
    const acts = [];
    for (let i = 0; i < count; i++) {
      const a = 1 + Math.floor(Math.random() * max);
      const b = 1 + Math.floor(Math.random() * max);
      acts.push(eq(a + " + " + b + " = ?", a + " plus " + b, a + b, skill || "addition"));
    }
    return acts;
  }

  function makeSubFacts(max, count, skill) {
    const acts = [];
    for (let i = 0; i < count; i++) {
      let a = 1 + Math.floor(Math.random() * max);
      let b = 1 + Math.floor(Math.random() * max);
      if (b > a) { const t = a; a = b; b = t; }
      acts.push(eq(a + " − " + b + " = ?", a + " minus " + b, a - b, skill || "subtraction"));
    }
    return acts;
  }

  function makeMulFacts(max, count) {
    const acts = [];
    for (let i = 0; i < count; i++) {
      const a = 2 + Math.floor(Math.random() * (max - 1));
      const b = 2 + Math.floor(Math.random() * (max - 1));
      acts.push(eq(a + " × " + b + " = ?", a + " times " + b, a * b, "multiplication"));
    }
    return acts;
  }

  function makeDivFacts(max, count) {
    const acts = [];
    for (let i = 0; i < count; i++) {
      const b = 2 + Math.floor(Math.random() * (max - 1));
      const q = 2 + Math.floor(Math.random() * (max - 1));
      const a = b * q;
      acts.push(eq(a + " ÷ " + b + " = ?", a + " divided by " + b, q, "division"));
    }
    return acts;
  }

  const countForest = {
    id: "count-forest",
    level: 1,
    name: "Count & Compare Forest",
    focus: "Counting and comparing",
    age: "Preschool",
    icon: "🌲",
    nodes: [
      {
        id: "count-path",
        name: "Count Path",
        blurb: "How many?",
        lessons: [
          lesson("cf-1", "Count to 5", ["counting"], [
            eq("Count: ★ ★ ★ — how many?", "how many stars", 3, "counting", [2, 3, 4, 5]),
            eq("Count: ● ● ● ● — how many?", "how many dots", 4, "counting", [3, 4, 5, 2]),
            eq("Count: ▲ ▲ — how many?", "how many triangles", 2, "counting", [1, 2, 3, 4]),
            eq("Count: ■ ■ ■ ■ ■ — how many?", "how many squares", 5, "counting", [4, 5, 3, 6]),
            eq("What comes after 2?", "after 2", 3, "counting", [1, 3, 4, 5]),
            eq("What comes after 4?", "after 4", 5, "counting", [3, 5, 6, 2])
          ], { xp: 20, stars: 1 }),
          lesson("cf-2", "Compare", ["counting"], [
            eq("Which is more: 3 or 5?", "which is more, 3 or 5", 5, "counting", [3, 5]),
            eq("Which is less: 2 or 4?", "which is less, 2 or 4", 2, "counting", [2, 4]),
            eq("Which is more: 1 or 6?", "which is more, 1 or 6", 6, "counting", [1, 6]),
            eq("Which is less: 7 or 3?", "which is less, 7 or 3", 3, "counting", [7, 3]),
            eq("Same or different: 4 and 4?", "are 4 and 4 the same", "same", "counting", ["same", "different"]),
            eq("Same or different: 2 and 5?", "are 2 and 5 the same", "different", "counting", ["same", "different"])
          ], { xp: 20, stars: 1, unlock: "count-more" })
        ]
      },
      {
        id: "count-more",
        name: "More Numbers",
        blurb: "Up to 10",
        lessons: [
          lesson("cf-3", "Count to 10", ["counting"], [
            eq("What comes after 7?", "after 7", 8, "counting", [6, 8, 9, 10]),
            eq("What comes after 9?", "after 9", 10, "counting", [8, 10, 11, 7]),
            eq("What comes before 5?", "before 5", 4, "counting", [3, 4, 5, 6]),
            eq("How many: 1 2 3 4 5 6?", "count to six", 6, "counting", [5, 6, 7, 8]),
            eq("Which is more: 8 or 5?", "which is more 8 or 5", 8, "counting", [8, 5]),
            eq("Which is less: 9 or 6?", "which is less 9 or 6", 6, "counting", [9, 6])
          ], { xp: 25, stars: 1 }),
          lesson("cf-4", "Compare more", ["counting"], [
            eq("Biggest: 2, 9, 4?", "biggest of 2 9 4", 9, "counting", [2, 9, 4]),
            eq("Smallest: 7, 3, 8?", "smallest of 7 3 8", 3, "counting", [7, 3, 8]),
            eq("What is 1 more than 6?", "one more than 6", 7, "counting", [5, 7, 8, 6]),
            eq("What is 1 less than 10?", "one less than 10", 9, "counting", [8, 9, 10, 11]),
            eq("Which is more: 10 or 1?", "more 10 or 1", 10, "counting", [10, 1]),
            eq("Order: what is middle of 1,2,3?", "middle of 1 2 3", 2, "counting", [1, 2, 3])
          ], { xp: 25, stars: 1 })
        ]
      }
    ]
  };

  function factsWorld(id, level, name, focus, age, icon, makerA, makerB, skill) {
    return {
      id: id,
      level: level,
      name: name,
      focus: focus,
      age: age,
      icon: icon,
      nodes: [
        {
          id: id + "-camp",
          name: "Facts Camp",
          blurb: "Build fluency",
          lessons: [
            lesson(id + "-1", "Set 1", [skill], makerA(), { xp: 25, stars: 1 }),
            lesson(id + "-2", "Set 2", [skill], makerB(), { xp: 25, stars: 1, unlock: id + "-quest" })
          ]
        },
        {
          id: id + "-quest",
          name: "Facts Quest",
          blurb: "Mix it up",
          lessons: [
            lesson(id + "-3", "Mixed 1", [skill], makerA().concat(makerB()).slice(0, 8), { xp: 30, stars: 1 }),
            lesson(id + "-4", "Mixed 2", [skill], makerB().concat(makerA()).slice(0, 8), { xp: 35, stars: 2 })
          ]
        }
      ]
    };
  }

  const addHatchery = factsWorld(
    "add-hatchery", 2, "Add/Sub Hatchery", "Facts within 10", "Pre-K/K", "🐣",
    function () { return makeAddFacts(5, 6, "addition"); },
    function () { return makeSubFacts(8, 6, "subtraction"); },
    "addition"
  );

  const factsMeadow = factsWorld(
    "facts-meadow", 3, "Facts Meadow", "Within 20", "K–1", "🌿",
    function () { return makeAddFacts(10, 6, "addition"); },
    function () {
      return makeSubFacts(15, 4, "subtraction").concat([
        eq("7 + __ = 10", "7 plus what equals 10", 3, "addition"),
        eq("12 − __ = 8", "12 minus what equals 8", 4, "subtraction")
      ]);
    },
    "addition"
  );

  const placeTown = {
    id: "place-town",
    level: 4,
    name: "Place Value Town",
    focus: "Tens and ones",
    age: "1st–2nd",
    icon: "🏘️",
    nodes: [
      {
        id: "pv-blocks",
        name: "Blocks Yard",
        blurb: "Tens & ones",
        lessons: [
          lesson("pv-1", "Place value 1", ["placeValue"], [
            eq("How many tens in 34?", "tens in 34", 3, "placeValue", [3, 4, 7, 34]),
            eq("How many ones in 34?", "ones in 34", 4, "placeValue", [3, 4, 7, 34]),
            eq("What is 2 tens and 5 ones?", "2 tens and 5 ones", 25, "placeValue"),
            eq("What is 4 tens and 0 ones?", "4 tens and 0 ones", 40, "placeValue"),
            eq("Which is greater: 45 or 54?", "greater 45 or 54", 54, "placeValue", [45, 54]),
            eq("Which is less: 19 or 91?", "less 19 or 91", 19, "placeValue", [19, 91])
          ], { xp: 25, stars: 1 }),
          lesson("pv-2", "Place value 2", ["placeValue"], [
            eq("How many tens in 70?", "tens in 70", 7, "placeValue", [0, 7, 70, 10]),
            eq("Round 23 to nearest ten?", "round 23", 20, "placeValue", [20, 30, 23, 10]),
            eq("Round 48 to nearest ten?", "round 48", 50, "placeValue", [40, 50, 48, 10]),
            eq("10 more than 36?", "10 more than 36", 46, "placeValue"),
            eq("10 less than 52?", "10 less than 52", 42, "placeValue"),
            eq("100 = how many tens?", "100 equals how many tens", 10, "placeValue", [1, 10, 100, 0])
          ], { xp: 30, stars: 1, unlock: "pv-compare" })
        ]
      },
      {
        id: "pv-compare",
        name: "Compare Street",
        blurb: "Bigger numbers",
        lessons: [
          lesson("pv-3", "Compare", ["placeValue"], [
            eq("Which is greater: 108 or 180?", "greater 108 or 180", 180, "placeValue", [108, 180]),
            eq("Which is less: 256 or 265?", "less 256 or 265", 256, "placeValue", [256, 265]),
            eq("Value of digit 7 in 74?", "value of 7 in 74", 70, "placeValue", [7, 70, 74, 4]),
            eq("Value of digit 5 in 52?", "value of 5 in 52", 50, "placeValue", [5, 50, 52, 2]),
            eq("Expand: 60 + 8 = ?", "60 plus 8", 68, "placeValue"),
            eq("Expand: 90 + 1 = ?", "90 plus 1", 91, "placeValue")
          ], { xp: 30, stars: 1 }),
          lesson("pv-4", "More place value", ["placeValue"], [
            eq("3 hundreds + 2 tens + 4 ones?", "324", 324, "placeValue"),
            eq("How many hundreds in 405?", "hundreds in 405", 4, "placeValue", [0, 4, 5, 405]),
            eq("10 more than 199?", "10 more than 199", 209, "placeValue"),
            eq("100 less than 350?", "100 less than 350", 250, "placeValue"),
            eq("Nearest ten to 67?", "nearest ten to 67", 70, "placeValue", [60, 70, 67, 65]),
            eq("Nearest hundred to 142?", "nearest hundred to 142", 100, "placeValue", [100, 200, 140, 150])
          ], { xp: 35, stars: 2 })
        ]
      }
    ]
  };

  const mulCastle = factsWorld(
    "mul-castle", 5, "Multiply/Divide Castle", "Facts and simple division", "2nd–3rd", "🏰",
    function () { return makeMulFacts(10, 6); },
    function () { return makeDivFacts(10, 6); },
    "multiplication"
  );

  const fractionsMap = {
    id: "fractions-map",
    level: 6,
    name: "Fractions Map",
    focus: "Halves, thirds, fourths",
    age: "3rd–4th",
    icon: "🍕",
    nodes: [
      {
        id: "frac-trail",
        name: "Fraction Trail",
        blurb: "Parts of a whole",
        lessons: [
          lesson("fr-1", "Basics", ["fractions"], [
            eq("1/2 of 8?", "one half of 8", 4, "fractions", [2, 4, 6, 8]),
            eq("1/2 of 10?", "one half of 10", 5, "fractions", [2, 5, 10, 8]),
            eq("1/4 of 8?", "one fourth of 8", 2, "fractions", [2, 4, 6, 8]),
            eq("1/3 of 9?", "one third of 9", 3, "fractions", [3, 6, 9, 1]),
            eq("Which is larger: 1/2 or 1/4?", "larger half or fourth", "1/2", "fractions", ["1/2", "1/4"]),
            eq("Which is smaller: 1/3 or 1/2?", "smaller third or half", "1/3", "fractions", ["1/3", "1/2"])
          ], { xp: 30, stars: 1 }),
          lesson("fr-2", "More fractions", ["fractions"], [
            eq("2/4 equals?", "two fourths equals", "1/2", "fractions", ["1/2", "1/4", "2/2", "1/3"]),
            eq("3/3 equals?", "three thirds equals", 1, "fractions", [0, 1, 3, "1/3"]),
            eq("1/2 of 12?", "half of 12", 6, "fractions"),
            eq("1/4 of 12?", "fourth of 12", 3, "fractions"),
            eq("Shade: how many fourths in a whole?", "fourths in a whole", 4, "fractions", [2, 3, 4, 5]),
            eq("Which is larger: 3/4 or 1/4?", "larger three fourths or one fourth", "3/4", "fractions", ["3/4", "1/4"])
          ], { xp: 35, stars: 2, unlock: "frac-peak" })
        ]
      },
      {
        id: "frac-peak",
        name: "Fraction Peak",
        blurb: "Compare & use",
        lessons: [
          lesson("fr-3", "Compare", ["fractions"], [
            eq("Which is larger: 2/3 or 1/3?", "larger 2/3 or 1/3", "2/3", "fractions", ["2/3", "1/3"]),
            eq("1/2 of 20?", "half of 20", 10, "fractions"),
            eq("3/4 of 8?", "three fourths of 8", 6, "fractions", [2, 4, 6, 8]),
            eq("Equivalent to 2/4?", "equivalent to 2/4", "1/2", "fractions", ["1/2", "1/4", "2/2"]),
            eq("How many halves in 1?", "halves in one", 2, "fractions", [1, 2, 3, 4]),
            eq("Which is smallest: 1/2, 1/3, 1/4?", "smallest", "1/4", "fractions", ["1/2", "1/3", "1/4"])
          ], { xp: 35, stars: 2 }),
          lesson("fr-4", "Apply", ["fractions"], [
            eq("Pizza cut in 4; eat 1. Left?", "three fourths", "3/4", "fractions", ["1/4", "3/4", "1/2", "1"]),
            eq("1/2 + 1/2 = ?", "half plus half", 1, "fractions", [0, 1, "1/2", 2]),
            eq("1/4 + 1/4 = ?", "fourth plus fourth", "1/2", "fractions", ["1/2", "1/4", "2/4", 1]),
            eq("2/3 of 9?", "two thirds of 9", 6, "fractions"),
            eq("Is 2/2 a whole?", "is 2/2 a whole", "yes", "fractions", ["yes", "no"]),
            eq("1 − 1/4 = ?", "one minus one fourth", "3/4", "fractions", ["3/4", "1/4", "1/2", 1])
          ], { xp: 40, stars: 2 })
        ]
      }
    ]
  };

  const multiHighlands = {
    id: "multi-highlands",
    level: 7,
    name: "Multi-digit Highlands",
    focus: "2–3 digit operations",
    age: "4th–5th",
    icon: "⚔️",
    nodes: [
      {
        id: "md-camp",
        name: "Digit Camp",
        blurb: "Bigger numbers",
        lessons: [
          lesson("md-1", "Add/sub big", ["addition", "subtraction"], [
            eq("24 + 13 = ?", "24 plus 13", 37, "addition"),
            eq("56 + 21 = ?", "56 plus 21", 77, "addition"),
            eq("48 − 15 = ?", "48 minus 15", 33, "subtraction"),
            eq("90 − 27 = ?", "90 minus 27", 63, "subtraction"),
            eq("125 + 40 = ?", "125 plus 40", 165, "addition"),
            eq("200 − 45 = ?", "200 minus 45", 155, "subtraction")
          ], { xp: 30, stars: 1 }),
          lesson("md-2", "Multiply bigger", ["multiplication"], [
            eq("12 × 3 = ?", "12 times 3", 36, "multiplication"),
            eq("15 × 4 = ?", "15 times 4", 60, "multiplication"),
            eq("20 × 5 = ?", "20 times 5", 100, "multiplication"),
            eq("11 × 6 = ?", "11 times 6", 66, "multiplication"),
            eq("25 × 2 = ?", "25 times 2", 50, "multiplication"),
            eq("13 × 4 = ?", "13 times 4", 52, "multiplication")
          ], { xp: 35, stars: 2, unlock: "md-peak" })
        ]
      },
      {
        id: "md-peak",
        name: "Summit Ops",
        blurb: "Mixed operations",
        lessons: [
          lesson("md-3", "Mixed 1", ["addition", "multiplication"], [
            eq("34 + 29 = ?", "34 plus 29", 63, "addition"),
            eq("16 × 5 = ?", "16 times 5", 80, "multiplication"),
            eq("81 − 37 = ?", "81 minus 37", 44, "subtraction"),
            eq("14 × 7 = ?", "14 times 7", 98, "multiplication"),
            eq("150 + 75 = ?", "150 plus 75", 225, "addition"),
            eq("300 − 128 = ?", "300 minus 128", 172, "subtraction")
          ], { xp: 40, stars: 2 }),
          lesson("md-4", "Mixed 2", ["division", "multiplication"], [
            eq("48 ÷ 4 = ?", "48 divided by 4", 12, "division"),
            eq("72 ÷ 8 = ?", "72 divided by 8", 9, "division"),
            eq("18 × 6 = ?", "18 times 6", 108, "multiplication"),
            eq("96 ÷ 6 = ?", "96 divided by 6", 16, "division"),
            eq("21 × 5 = ?", "21 times 5", 105, "multiplication"),
            eq("120 ÷ 10 = ?", "120 divided by 10", 12, "division")
          ], { xp: 45, stars: 2 })
        ]
      }
    ]
  };

  const wordPeaks = {
    id: "word-peaks",
    level: 8,
    name: "Word-Problem Peaks",
    focus: "1–2 step stories",
    age: "5th–6th",
    icon: "📖",
    nodes: [
      {
        id: "wp-trail",
        name: "Story Trail",
        blurb: "Read & solve",
        lessons: [
          lesson("wp-1", "One step", ["wordProblems"], [
            eq("Sam has 8 apples and gets 5 more. How many now?", "8 plus 5", 13, "wordProblems"),
            eq("Mia had 20 stickers and gave away 7. How many left?", "20 minus 7", 13, "wordProblems"),
            eq("4 bags with 6 oranges each. Total oranges?", "4 times 6", 24, "wordProblems"),
            eq("18 pencils shared equally among 3 kids. Each gets?", "18 divided by 3", 6, "wordProblems"),
            eq("A rope is 15 feet. Cut off 4 feet. Left?", "15 minus 4", 11, "wordProblems"),
            eq("Tickets cost $5 each. Buy 7. Total cost?", "5 times 7", 35, "wordProblems")
          ], { xp: 35, stars: 2 }),
          lesson("wp-2", "Two step", ["wordProblems"], [
            eq("Lee buys 3 packs of 4 cards, then 2 more cards. Total?", "3 times 4 plus 2", 14, "wordProblems"),
            eq("Ava has $20. Buys a $7 book and a $5 pen. Left?", "20 minus 7 minus 5", 8, "wordProblems"),
            eq("12 muffins. Eat 3, share rest between 3 friends equally. Each friend?", "(12-3)/3", 3, "wordProblems"),
            eq("2 rows of 8 chairs, then add 4 chairs. Total?", "2 times 8 plus 4", 20, "wordProblems"),
            eq("Bus has 40 seats. 28 filled. How many empty?", "40 minus 28", 12, "wordProblems"),
            eq("Ran 3 miles a day for 5 days, then 2 more miles. Total?", "3 times 5 plus 2", 17, "wordProblems")
          ], { xp: 40, stars: 2, unlock: "wp-summit" })
        ]
      },
      {
        id: "wp-summit",
        name: "Summit Stories",
        blurb: "Harder stories",
        lessons: [
          lesson("wp-3", "Stories 1", ["wordProblems"], [
            eq("Class of 24 splits into groups of 6. How many groups?", "24 divided by 6", 4, "wordProblems"),
            eq("Save $9 a week for 4 weeks. Total saved?", "9 times 4", 36, "wordProblems"),
            eq("Had 50 points, lost 12, gained 8. Now?", "50 minus 12 plus 8", 46, "wordProblems"),
            eq("5 shelves with 12 books each. Total books?", "5 times 12", 60, "wordProblems"),
            eq("Pizza: 16 slices, 4 friends share equally. Each?", "16 divided by 4", 4, "wordProblems"),
            eq("Plant grows 3 cm/day for 6 days. Growth?", "3 times 6", 18, "wordProblems")
          ], { xp: 40, stars: 2 }),
          lesson("wp-4", "Stories 2", ["wordProblems"], [
            eq("Buy 2 toys at $8 and 1 at $5. Total?", "2 times 8 plus 5", 21, "wordProblems"),
            eq("Tank holds 30 L. Filled with 18 L. Space left?", "30 minus 18", 12, "wordProblems"),
            eq("Team scores 3, then 3, then 4. Total points?", "3 plus 3 plus 4", 10, "wordProblems"),
            eq("Pack of 36 crayons into boxes of 9. Boxes needed?", "36 divided by 9", 4, "wordProblems"),
            eq("Walk 2 km, rest, walk 3 km, then 1 km. Total?", "2 plus 3 plus 1", 6, "wordProblems"),
            eq("12 eggs, use 5 for cake, rest split by 7 people? Each?", "(12-5)/7", 1, "wordProblems")
          ], { xp: 45, stars: 2 })
        ]
      }
    ]
  };

  const preAlgLibrary = {
    id: "prealg-library",
    level: 9,
    name: "Pre-Algebra Library",
    focus: "Expressions and equations",
    age: "6th–7th",
    icon: "📐",
    nodes: [
      {
        id: "pa-stacks",
        name: "Symbol Stacks",
        blurb: "Find the unknown",
        lessons: [
          lesson("pa-1", "Missing numbers", ["preAlgebra"], [
            eq("n + 5 = 12. What is n?", "n plus 5 equals 12", 7, "preAlgebra"),
            eq("n − 4 = 9. What is n?", "n minus 4 equals 9", 13, "preAlgebra"),
            eq("3n = 15. What is n?", "3 times n equals 15", 5, "preAlgebra"),
            eq("n / 2 = 8. What is n?", "n divided by 2 equals 8", 16, "preAlgebra"),
            eq("2n + 1 = 9. What is n?", "2 n plus 1 equals 9", 4, "preAlgebra"),
            eq("10 − n = 3. What is n?", "10 minus n equals 3", 7, "preAlgebra")
          ], { xp: 40, stars: 2 }),
          lesson("pa-2", "Expressions", ["preAlgebra"], [
            eq("Value of 3(4 + 2)?", "3 times open parenthesis 4 plus 2", 18, "preAlgebra"),
            eq("Value of 5 × 2 + 3?", "5 times 2 plus 3", 13, "preAlgebra"),
            eq("Value of 20 − 4 × 2?", "20 minus 4 times 2", 12, "preAlgebra"),
            eq("If a=3, value of 2a + 4?", "2 a plus 4 when a is 3", 10, "preAlgebra"),
            eq("If b=5, value of b²?", "b squared when b is 5", 25, "preAlgebra"),
            eq("Simplify: n + n + n = ?", "n plus n plus n", "3n", "preAlgebra", ["3n", "n3", "n+3", "2n"])
          ], { xp: 45, stars: 2, unlock: "pa-hall" })
        ]
      },
      {
        id: "pa-hall",
        name: "Equation Hall",
        blurb: "Solve & reason",
        lessons: [
          lesson("pa-3", "Equations 1", ["preAlgebra"], [
            eq("4n = 28. n=?", "4 n equals 28", 7, "preAlgebra"),
            eq("n/5 = 6. n=?", "n divided by 5 equals 6", 30, "preAlgebra"),
            eq("n + 12 = 20. n=?", "n plus 12 equals 20", 8, "preAlgebra"),
            eq("2n − 3 = 11. n=?", "2 n minus 3 equals 11", 7, "preAlgebra"),
            eq("15 = 3n. n=?", "15 equals 3 n", 5, "preAlgebra"),
            eq("n − 9 = 16. n=?", "n minus 9 equals 16", 25, "preAlgebra")
          ], { xp: 45, stars: 2 }),
          lesson("pa-4", "Equations 2", ["preAlgebra"], [
            eq("3(n + 2) = 18. n=?", "3 times n plus 2 equals 18", 4, "preAlgebra"),
            eq("If perimeter of square is 20, side?", "side of square perimeter 20", 5, "preAlgebra"),
            eq("Pattern: 2,4,6,8 next?", "next after 2 4 6 8", 10, "preAlgebra"),
            eq("Pattern: 5,10,15 next?", "next after 5 10 15", 20, "preAlgebra"),
            eq("Solve: n/4 + 1 = 5. n=?", "n over 4 plus 1 equals 5", 16, "preAlgebra"),
            eq("Is n=3 a solution to 2n=8?", "is 3 a solution to 2n equals 8", "no", "preAlgebra", ["yes", "no"])
          ], { xp: 50, stars: 3 })
        ]
      }
    ]
  };

  const WORLDS = [countForest, addHatchery, factsMeadow, placeTown, mulCastle, fractionsMap, multiHighlands, wordPeaks, preAlgLibrary];

  const GRADE_BANDS = [
    { grade: 1, worldId: "count-forest", startNode: null, label: "Preschool", name: "Count & Compare Forest", age: "Preschool" },
    { grade: 2, worldId: "add-hatchery", startNode: null, label: "Pre-K/K", name: "Add/Sub Hatchery", age: "Pre-K/K" },
    { grade: 3, worldId: "facts-meadow", startNode: null, label: "K–1", name: "Facts Meadow", age: "K–1" },
    { grade: 4, worldId: "place-town", startNode: null, label: "1st–2nd", name: "Place Value Town", age: "1st–2nd" },
    { grade: 5, worldId: "mul-castle", startNode: null, label: "2nd–3rd", name: "Multiply/Divide Castle", age: "2nd–3rd" },
    { grade: 6, worldId: "fractions-map", startNode: null, label: "3rd–4th", name: "Fractions Map", age: "3rd–4th" },
    { grade: 7, worldId: "multi-highlands", startNode: null, label: "4th–5th", name: "Multi-digit Highlands", age: "4th–5th" },
    { grade: 8, worldId: "word-peaks", startNode: null, label: "5th–6th", name: "Word-Problem Peaks", age: "5th–6th" },
    { grade: 9, worldId: "prealg-library", startNode: null, label: "6th–7th", name: "Pre-Algebra Library", age: "6th–7th" }
  ];

  const MAP_REGIONS = GRADE_BANDS.map(function (b, i) {
    const w = WORLDS[i];
    return { id: w.id, level: b.grade, name: w.name, focus: w.focus, age: w.age, icon: w.icon, startNode: b.startNode };
  });

  const PLACEMENT_QUESTIONS = [
    eq("Count: ★ ★ ★ — how many?", "how many", 3, "counting", [2, 3, 4, 5]),
    eq("Which is more: 2 or 5?", "more 2 or 5", 5, "counting", [2, 5]),
    eq("3 + 4 = ?", "3 plus 4", 7, "addition"),
    eq("9 − 2 = ?", "9 minus 2", 7, "subtraction"),
    eq("8 + 7 = ?", "8 plus 7", 15, "addition"),
    eq("14 − 6 = ?", "14 minus 6", 8, "subtraction"),
    eq("How many tens in 45?", "tens in 45", 4, "placeValue", [4, 5, 45, 9]),
    eq("2 tens and 3 ones = ?", "23", 23, "placeValue"),
    eq("6 × 4 = ?", "6 times 4", 24, "multiplication"),
    eq("18 ÷ 3 = ?", "18 divided by 3", 6, "division"),
    eq("1/2 of 10?", "half of 10", 5, "fractions", [2, 5, 10, 8]),
    eq("Which larger: 1/2 or 1/4?", "larger half or fourth", "1/2", "fractions", ["1/2", "1/4"]),
    eq("25 + 17 = ?", "25 plus 17", 42, "addition"),
    eq("12 × 5 = ?", "12 times 5", 60, "multiplication"),
    eq("Mia had 20, gave 7. Left?", "20 minus 7", 13, "wordProblems"),
    eq("4 bags of 6. Total?", "4 times 6", 24, "wordProblems"),
    eq("n + 5 = 12. n=?", "n plus 5 equals 12", 7, "preAlgebra"),
    eq("3n = 15. n=?", "3 n equals 15", 5, "preAlgebra")
  ];
  PLACEMENT_QUESTIONS.forEach(function (q, i) {
    q.tier = Math.min(9, Math.floor(i / 2) + 1);
  });

  const SKILL_LABELS = {
    counting: "Counting",
    addition: "Addition",
    subtraction: "Subtraction",
    placeValue: "Place value",
    multiplication: "Multiplication",
    division: "Division",
    fractions: "Fractions",
    wordProblems: "Word problems",
    preAlgebra: "Pre-algebra"
  };

  const MASTERY = {
    counting: 70,
    addition: 65,
    subtraction: 65,
    placeValue: 60,
    multiplication: 60,
    division: 60,
    fractions: 55,
    wordProblems: 55,
    preAlgebra: 55
  };

  const COSMETICS = [
    { id: "frame-calc", name: "Calc Frame", cost: 20, unlockAtStars: 3 },
    { id: "frame-grid", name: "Grid Frame", cost: 40, unlockAtStars: 8 },
    { id: "frame-pi", name: "Pi Frame", cost: 80, unlockAtStars: 15 },
    { id: "sticker-star", name: "Star Sticker", cost: 10, unlockAtStars: 1 },
    { id: "sticker-123", name: "123 Sticker", cost: 25, unlockAtStars: 5 }
  ];

  const REMEDIATION_BANK = {
    counting: [
      eq("What comes after 3?", "after 3", 4, "counting", [2, 4, 5, 6]),
      eq("Which is more: 2 or 6?", "more 2 or 6", 6, "counting", [2, 6])
    ],
    addition: makeAddFacts(5, 4, "addition"),
    subtraction: makeSubFacts(8, 4, "subtraction"),
    placeValue: [
      eq("How many tens in 50?", "tens in 50", 5, "placeValue", [0, 5, 50, 10]),
      eq("2 tens + 4 ones?", "24", 24, "placeValue")
    ],
    multiplication: makeMulFacts(5, 4),
    division: makeDivFacts(5, 4),
    fractions: [
      eq("1/2 of 6?", "half of 6", 3, "fractions", [2, 3, 6, 1]),
      eq("1/4 of 8?", "fourth of 8", 2, "fractions", [2, 4, 8, 1])
    ],
    wordProblems: [
      eq("Had 10, gave 3. Left?", "10 minus 3", 7, "wordProblems"),
      eq("3 packs of 2. Total?", "3 times 2", 6, "wordProblems")
    ],
    preAlgebra: [
      eq("n + 2 = 5. n=?", "n plus 2 equals 5", 3, "preAlgebra"),
      eq("2n = 8. n=?", "2 n equals 8", 4, "preAlgebra")
    ]
  };

  function countWorldActivities(worldId) {
    const world = WORLDS.find(function (w) { return w.id === worldId; });
    if (!world) return 0;
    let n = 0;
    world.nodes.forEach(function (node) {
      node.lessons.forEach(function (l) { n += l.activities.length; });
    });
    return n;
  }

  function isWorldPreview(worldId) {
    return countWorldActivities(worldId) < 10;
  }


  const COMPANIONS = [
  {
    "id": "number-turtle",
    "assetId": "number-turtle",
    "name": "Number Turtle",
    "emoji": "🐢",
    "unlock": "first-lesson",
    "lines": {
      "correct": "Turtle: Steady and true!",
      "miss": "Turtle: One step at a time.",
      "complete": "Turtle: Shell of pride!",
      "boss": "Turtle: Slow and mastered!"
    }
  },
  {
    "id": "countbot",
    "assetId": "countbot",
    "name": "Countbot",
    "emoji": "🤖",
    "unlock": "lessons",
    "unlockAt": 4,
    "lines": {
      "correct": "Countbot: Beep—correct!",
      "miss": "Countbot: Recalculating…",
      "complete": "Countbot: Quest logged!",
      "boss": "Countbot: Systems restored!"
    }
  },
  {
    "id": "fraction-fox",
    "assetId": "fraction-fox",
    "name": "Fraction Fox",
    "emoji": "🦊",
    "unlock": "stars",
    "unlockAt": 6,
    "lines": {
      "correct": "Fox: Nice split!",
      "miss": "Fox: Break it into parts.",
      "complete": "Fox: Pieces in place!",
      "boss": "Fox: Whole again!"
    }
  },
  {
    "id": "equation-dragon",
    "assetId": "equation-dragon",
    "name": "Equation Dragon",
    "emoji": "🐉",
    "unlock": "boss",
    "lines": {
      "correct": "Dragon: Fire of yes!",
      "miss": "Dragon: Cool down, retry.",
      "complete": "Dragon: Numbers aligned!",
      "boss": "Dragon: You solved the realm!"
    }
  }
];
  const MISSIONS = {
  "count-forest:count-path:cf-1": {
    "title": "Count the Forest Lights",
    "blurb": "The forest numbers went dark—count them back.",
    "emoji": "🌲"
  },
  "add-hatchery:add-hatchery-camp:add-hatchery-1": {
    "title": "Repair the Add Nest",
    "blurb": "Solve facts to wake the hatchery.",
    "emoji": "🐣"
  }
};
  const BOSSES = {
  "count-forest:count-more": {
    "title": "The Number Scrambler",
    "blurb": "Solve a few to unscramble the kingdom.",
    "emoji": "🐉",
    "reward": {
      "xp": 20,
      "stars": 2
    },
    "activities": [
      {
        "type": "choice",
        "prompt": "Which is more: 3 or 7?",
        "speak": "more 3 or 7",
        "answer": "7",
        "options": [
          "3",
          "7"
        ],
        "skill": "counting"
      },
      {
        "type": "equation",
        "prompt": "4 + 3 = ?",
        "speak": "4 plus 3",
        "answer": "7",
        "skill": "addition",
        "payload": {
          "equation": "4 + 3 = ?"
        }
      },
      {
        "type": "equation",
        "prompt": "9 − 2 = ?",
        "speak": "9 minus 2",
        "answer": "7",
        "skill": "subtraction",
        "payload": {
          "equation": "9 − 2 = ?"
        }
      }
    ]
  }
};
  const WORLD_STAGES = {
  "count-forest": [
    {
      "icon": "🌱",
      "label": "Quiet Clearing"
    },
    {
      "icon": "🌲",
      "label": "Counting Forest"
    },
    {
      "icon": "🏡",
      "label": "Number Village"
    },
    {
      "icon": "🏰",
      "label": "Count Keep"
    }
  ],
  "add-hatchery": [
    {
      "icon": "🌱",
      "label": "Empty Nest"
    },
    {
      "icon": "🐣",
      "label": "Add Hatchery"
    },
    {
      "icon": "🏘️",
      "label": "Fact Town"
    },
    {
      "icon": "🏰",
      "label": "Sum Castle"
    }
  ],
  "facts-meadow": [
    {
      "icon": "🌱",
      "label": "Soft Grass"
    },
    {
      "icon": "🌿",
      "label": "Facts Meadow"
    },
    {
      "icon": "🏡",
      "label": "Twenty Farm"
    },
    {
      "icon": "🏰",
      "label": "Fact Fortress"
    }
  ],
  "place-town": [
    {
      "icon": "🌱",
      "label": "Ones Lane"
    },
    {
      "icon": "🏘️",
      "label": "Place Value Town"
    },
    {
      "icon": "🏙️",
      "label": "Tens City"
    },
    {
      "icon": "🏰",
      "label": "Hundred Hall"
    }
  ],
  "mul-castle": [
    {
      "icon": "🌱",
      "label": "Quiet Gate"
    },
    {
      "icon": "🏰",
      "label": "Multiply Castle"
    },
    {
      "icon": "🏯",
      "label": "Divide Wing"
    },
    {
      "icon": "👑",
      "label": "Factor Crown"
    }
  ],
  "fractions-map": [
    {
      "icon": "🌱",
      "label": "Whole Pie"
    },
    {
      "icon": "🍕",
      "label": "Fractions Map"
    },
    {
      "icon": "🏞️",
      "label": "Half Valley"
    },
    {
      "icon": "🏰",
      "label": "Fraction Keep"
    }
  ],
  "multi-highlands": [
    {
      "icon": "🌱",
      "label": "Digit Camp"
    },
    {
      "icon": "⚔️",
      "label": "Multi-digit Highlands"
    },
    {
      "icon": "🏔️",
      "label": "Ops Summit"
    },
    {
      "icon": "🏰",
      "label": "Calc Castle"
    }
  ],
  "word-peaks": [
    {
      "icon": "🌱",
      "label": "Story Base"
    },
    {
      "icon": "📖",
      "label": "Word-Problem Peaks"
    },
    {
      "icon": "🏔️",
      "label": "Two-Step Ridge"
    },
    {
      "icon": "🏰",
      "label": "Problem Spire"
    }
  ],
  "prealg-library": [
    {
      "icon": "🌱",
      "label": "Symbol Shelf"
    },
    {
      "icon": "📐",
      "label": "Pre-Algebra Library"
    },
    {
      "icon": "🏛️",
      "label": "Equation Hall"
    },
    {
      "icon": "👑",
      "label": "Algebra Crown"
    }
  ]
};
  const LAB_PROMPTS = [
  "Make a puzzle: ___ + 5 = 12. What is ___?",
  "Invent a word problem about sharing cookies.",
  "Write three equations that all equal 10."
];
  const DAILY_POOL = [
  {
    "type": "equation",
    "prompt": "3 + 4 = ?",
    "speak": "3 plus 4",
    "answer": "7",
    "skill": "addition",
    "payload": {
      "equation": "3 + 4 = ?"
    }
  },
  {
    "type": "equation",
    "prompt": "10 − 3 = ?",
    "speak": "10 minus 3",
    "answer": "7",
    "skill": "subtraction",
    "payload": {
      "equation": "10 − 3 = ?"
    }
  },
  {
    "type": "choice",
    "prompt": "Which is more: 5 or 2?",
    "speak": "more 5 or 2",
    "answer": "5",
    "options": [
      "5",
      "2"
    ],
    "skill": "counting"
  },
  {
    "type": "equation",
    "prompt": "2 × 4 = ?",
    "speak": "2 times 4",
    "answer": "8",
    "skill": "multiplication",
    "payload": {
      "equation": "2 × 4 = ?"
    }
  }
];

  global.NBContent = {
    COMPANIONS: COMPANIONS,
    MISSIONS: MISSIONS,
    BOSSES: BOSSES,
    WORLD_STAGES: WORLD_STAGES,
    LAB_PROMPTS: LAB_PROMPTS,
    DAILY_POOL: DAILY_POOL,
    WORLDS: WORLDS,
    GRADE_BANDS: GRADE_BANDS,
    MAP_REGIONS: MAP_REGIONS,
    PLACEMENT_QUESTIONS: PLACEMENT_QUESTIONS,
    SKILL_LABELS: SKILL_LABELS,
    MASTERY: MASTERY,
    COSMETICS: COSMETICS,
    REMEDIATION_BANK: REMEDIATION_BANK,
    countWorldActivities: countWorldActivities,
    isWorldPreview: isWorldPreview,
    getWorld: function (id) { return WORLDS.find(function (w) { return w.id === id; }) || null; },
    getNode: function (worldId, nodeId) {
      const world = this.getWorld(worldId);
      if (!world) return null;
      return world.nodes.find(function (n) { return n.id === nodeId; }) || null;
    },
    getLesson: function (worldId, nodeId, lessonId) {
      const node = this.getNode(worldId, nodeId);
      if (!node) return null;
      return node.lessons.find(function (l) { return l.id === lessonId; }) || null;
    }
  };
})(typeof window !== "undefined" ? window : globalThis);
