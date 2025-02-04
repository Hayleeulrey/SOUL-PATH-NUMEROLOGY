export interface NumerologyDefinition {
  meaning: string
  biblicalReference?: string
}

export interface PersonalNumberVibration {
  [key: string]: NumerologyDefinition
}

export const soulNumberDefinitions: { [key: string]: NumerologyDefinition } = {
  "1": {
    meaning:
      "As a Soul Number, 1 represents the essence of divine creation and new beginnings. Individuals with this number are often natural leaders, filled with originality, independence, and ambition. They are driven by a strong will and purpose, often pioneering new paths and inspiring others to follow. The number 1 in biblical terms signifies the power and sovereignty of God, as seen in Genesis 1:1, where God initiates creation. People with this number may feel called to step forward in faith, trust in their uniqueness, and lead with confidence, embodying God's purpose in their lives.",
    biblicalReference: "Genesis 1:1 - 'In the beginning, God created the heavens and the earth.'",
  },
  "2": {
    meaning:
      "The Soul Number 2 signifies balance, harmony, and cooperation. Those who resonate with this number are peacemakers, gifted in diplomacy and mediation. They often seek to unify and bring people together, valuing relationships and emotional depth. Biblically, 2 is significant in the concept of unity and companionship, as reflected in Ecclesiastes 4:9, which emphasizes the strength found in partnership. This number encourages patience, faith, and trust in divine timing, reminding the individual that collaboration and mutual support are integral to fulfilling God's will.",
    biblicalReference: "Ecclesiastes 4:9 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "3": {
    meaning:
      "As a Soul Number, 3 embodies creative expression, joy, and communication. Individuals with this number are often artistic, sociable, and full of optimism. They have a natural gift for inspiring others through words, music, or art. Biblically, 3 is a number of divine completeness, representing the Holy Trinity—the Father, the Son, and the Holy Spirit. This number calls on individuals to express themselves with faith and confidence, knowing that their creativity and enthusiasm reflect God's joy and purpose.",
    biblicalReference: "Ecclesiastes 4:12 - 'A cord of three strands is not quickly broken.'",
  },
  "4": {
    meaning:
      "The Soul Number 4 represents stability, structure, and discipline. Those with this number are hardworking, practical, and grounded, often laying the foundations for others to build upon. They value tradition and order, much like God's emphasis on divine structure in creation. Biblically, the number 4 represents universality, as seen in the four corners of the earth and the four seasons. Individuals with this number are called to build with faith, trusting in the solid foundation of God's wisdom.",
    biblicalReference:
      "Isaiah 11:2 - 'The Spirit of wisdom and of understanding, the Spirit of counsel and of might, the Spirit of the knowledge and fear of the Lord.'",
  },
  "5": {
    meaning:
      "Freedom, adventure, and change define the Soul Number 5. People with this number thrive on variety and exploration, often seeking new experiences that challenge and expand their perspectives. Biblically, the number 5 represents God's grace and the transformation it brings, as reflected in the Five Books of Moses. Individuals with this number are called to embrace change with faith, knowing that their journey is guided by divine wisdom and purpose.",
    biblicalReference: "Deuteronomy 5:6-21 - The Five Books of Moses and the Ten Commandments.",
  },
  "6": {
    meaning:
      "The Soul Number 6 symbolizes responsibility, compassion, and service to others. Those who resonate with this number are natural caregivers, healers, and teachers. They find fulfillment in nurturing others and maintaining harmony in their environment. Biblically, 6 is associated with the work of creation and human responsibility, as seen in Genesis 1:31. This number calls on individuals to embrace their role as stewards of God's love, using their gifts to uplift and heal.",
    biblicalReference:
      "Genesis 1:31 - 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.'",
  },
  "7": {
    meaning:
      "The Soul Number 7 is deeply spiritual, representing introspection, wisdom, and divine knowledge. Individuals with this number are seekers of truth, often drawn to study, meditation, and philosophical pursuits. Biblically, 7 is the number of divine perfection and completion, as seen in God's rest on the seventh day. People with this number are encouraged to trust in divine revelations and walk a path of spiritual enlightenment.",
    biblicalReference:
      "Genesis 2:2 - 'By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work.'",
  },
  "8": {
    meaning:
      "Power, ambition, and material success define the Soul Number 8. Those with this number are often gifted with leadership skills and a drive to achieve greatness. They are called to use their resources responsibly, ensuring that their success benefits others. Biblically, 8 represents new beginnings and resurrection, as seen in the story of Noah. Individuals with this number must balance material pursuits with spiritual integrity, knowing that their efforts are guided by divine providence.",
    biblicalReference: "2 Peter 2:5 - Noah, the eighth person, a preacher of righteousness.",
  },
  "9": {
    meaning:
      "The Soul Number 9 signifies compassion, selflessness, and universal love. People with this number are deeply humanitarian, drawn to causes that serve the greater good. Biblically, 9 represents the fruits of the Spirit—qualities that reflect God's love and grace. This number encourages individuals to let go of ego and embrace a higher calling, serving others with humility and kindness.",
    biblicalReference: "Galatians 5:22-23 - The nine fruits of the Spirit.",
  },
  "11": {
    meaning: "Inspirational, intuitive, visionary. Spiritual messenger.",
    biblicalReference: "John 11:11 - 'Our friend Lazarus has fallen asleep; but I am going there to wake him up.'",
  },
  "22": {
    meaning: "Master builder, practical visionary, powerful achiever.",
    biblicalReference: "Revelation 22 - The final chapter of the Bible, describing the New Jerusalem.",
  },
  "33": {
    meaning: "Master teacher, compassionate mentor, selfless service.",
    biblicalReference: "The age of Jesus at crucifixion, symbolizing divine sacrifice and love.",
  },
}

export const destinyNumberDefinitions: { [key: string]: NumerologyDefinition } = {
  "1": {
    meaning:
      "The Path of Destiny Number 1 signifies a journey of leadership, independence, and self-discovery. Individuals with this path are destined to carve their own way, relying on inner strength and determination to achieve their goals. Their life's purpose involves developing confidence, pioneering new ideas, and taking the initiative in various aspects of life. Biblically, 1 symbolizes God's singular authority and the beginning of all things, as reflected in Genesis 1:1. This number calls people to trust in their abilities, overcome obstacles, and lead with integrity.",
    biblicalReference: "Genesis 1:1 - 'In the beginning, God created the heavens and the earth.'",
  },
  "2": {
    meaning:
      "The Path of Destiny Number 2 is one of cooperation, harmony, and service. Individuals on this path are called to build relationships, mediate conflicts, and bring balance to their surroundings. They excel in teamwork and have a deep understanding of others' emotions, making them natural peacekeepers. Biblically, the number 2 is associated with unity and companionship, as highlighted in Ecclesiastes 4:9, which speaks of the strength of partnerships. Those with this path are meant to learn patience, trust, and faith in collaborating with others for a greater purpose.",
    biblicalReference: "Ecclesiastes 4:9 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "3": {
    meaning:
      "The Path of Destiny Number 3 is one of creativity, self-expression, and inspiration. People with this path are meant to bring joy, wisdom, and encouragement to others through their words, artistic talents, and storytelling abilities. They thrive when using their creativity to uplift and inspire those around them. Biblically, the number 3 represents divine completeness and the Trinity—the Father, the Son, and the Holy Spirit. Those with this destiny number are called to embrace their communication skills and inspire faith.",
    biblicalReference: "Ecclesiastes 4:12 - 'A cord of three strands is not quickly broken.'",
  },
  "4": {
    meaning:
      "The Path of Destiny Number 4 represents a life of discipline, stability, and perseverance. Individuals with this number are meant to build strong foundations, both in their personal lives and communities. They are practical, diligent, and committed to creating lasting success. Biblically, 4 is a number of universal order, as reflected in the four seasons and the four corners of the earth. Those with this path are called to serve as pillars of faith, working with patience and dedication to create meaningful change.",
    biblicalReference:
      "Isaiah 11:2 - 'The Spirit of wisdom and of understanding, the Spirit of counsel and of might, the Spirit of the knowledge and fear of the Lord.'",
  },
  "5": {
    meaning:
      "The Path of Destiny Number 5 is one of adventure, change, and personal freedom. People with this path are meant to embrace life's unpredictability and use their adaptability to thrive in any situation. They are seekers of wisdom and new experiences, bringing transformation wherever they go. Biblically, 5 represents God's grace and the journey of transformation, seen in the Five Books of Moses. Those with this destiny number must learn to balance freedom with responsibility, trusting that every change is part of a divine plan.",
    biblicalReference: "Deuteronomy 5:6-21 - The Five Books of Moses and the Ten Commandments.",
  },
  "6": {
    meaning:
      "The Path of Destiny Number 6 is one of love, responsibility, and nurturing. Those on this path are called to serve others through acts of kindness, care, and compassion. They often find themselves in roles where they provide emotional and physical support to those in need. Biblically, 6 is connected to creation and human responsibility, as seen in Genesis 1:31. This number calls individuals to embrace their purpose as caregivers, bringing balance and healing to the world.",
    biblicalReference:
      "Genesis 1:31 - 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.'",
  },
  "7": {
    meaning:
      "The Path of Destiny Number 7 is a journey of wisdom, introspection, and spiritual growth. Those with this number are meant to seek truth, gaining knowledge and enlightenment through study and deep contemplation. They often find themselves drawn to spiritual teachings and philosophical pursuits. Biblically, 7 represents divine perfection and the completion of God's work, as seen in Genesis 2:2. Those with this destiny number are called to trust in their inner wisdom and develop a deep connection to faith.",
    biblicalReference:
      "Genesis 2:2 - 'By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work.'",
  },
  "8": {
    meaning:
      "The Path of Destiny Number 8 is one of ambition, power, and material success. Individuals with this path are meant to achieve great things, using their leadership abilities and financial wisdom to create lasting impact. They are called to balance material wealth with spiritual integrity, ensuring their success is built on a foundation of righteousness. Biblically, 8 represents new beginnings and divine renewal, as seen in the story of Noah. Those with this number are called to lead with faith and use their influence for good.",
    biblicalReference: "2 Peter 2:5 - Noah, the eighth person, a preacher of righteousness.",
  },
  "9": {
    meaning:
      "The Path of Destiny Number 9 is one of compassion, selflessness, and humanitarian service. Those with this path are meant to dedicate their lives to helping others and making the world a better place. They are wise, empathetic, and deeply connected to spiritual truths. Biblically, 9 represents the fruits of the Spirit, qualities that reflect divine love and grace. Those with this destiny number must embrace their higher calling, serving with humility and generosity.",
    biblicalReference: "Galatians 5:22-23 - The nine fruits of the Spirit.",
  },
  "11": {
    meaning: "You are called to be an inspirational leader and spiritual messenger.",
    biblicalReference:
      "Acts 2:17 - 'In the last days, God says, I will pour out my Spirit on all people. Your sons and daughters will prophesy.'",
  },
  "22": {
    meaning: "Your destiny is to be a master builder, turning dreams into reality on a large scale.",
    biblicalReference: "Exodus 31:1-5 - God calls Bezalel to be the master craftsman for the Tabernacle.",
  },
  "33": {
    meaning: "You are destined to be a compassionate teacher and healer, serving humanity selflessly.",
    biblicalReference:
      "Matthew 9:35 - Jesus went through all the towns and villages, teaching, preaching, and healing every disease and sickness.",
  },
}

export const outerPersonalityNumberDefinitions: { [key: string]: NumerologyDefinition } = {
  "1": {
    meaning:
      "The Outer Personality Number 1 signifies a strong, independent, and confident exterior. Individuals with this number are perceived as leaders, innovators, and self-reliant individuals who take charge of situations. They exude an aura of determination and assertiveness, inspiring others to follow their lead. Biblically, 1 symbolizes God's singular authority and creative power, as seen in Genesis 1:1. People with this number are often seen as pioneers, setting trends and taking bold steps forward.",
    biblicalReference: "Genesis 1:1 - 'In the beginning, God created the heavens and the earth.'",
  },
  "2": {
    meaning:
      "The Outer Personality Number 2 reflects a gentle, cooperative, and diplomatic nature. Individuals with this number are perceived as peacemakers who strive for balance and harmony in their relationships. They are often seen as kind, considerate, and emotionally intuitive, making them natural mediators. Biblically, the number 2 is associated with unity and companionship, as highlighted in Ecclesiastes 4:9. People with this number often appear patient, trustworthy, and supportive.",
    biblicalReference: "Ecclesiastes 4:9 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "3": {
    meaning:
      "The Outer Personality Number 3 exudes joy, creativity, and charisma. Individuals with this number are perceived as expressive, lively, and socially engaging. They have a talent for communication and often stand out in group settings with their enthusiasm and wit. Biblically, 3 represents divine completeness and the Holy Trinity. Those with this number are often seen as uplifting figures, spreading optimism and inspiration.",
    biblicalReference: "Ecclesiastes 4:12 - 'A cord of three strands is not quickly broken.'",
  },
  "4": {
    meaning:
      "The Outer Personality Number 4 reflects reliability, discipline, and practicality. Individuals with this number are perceived as dependable, hardworking, and structured. They exude a strong sense of stability and order, making them trustworthy and grounded figures. Biblically, 4 is associated with universal order and God's structured creation. Those with this number often appear reserved but steadfast, providing a sense of security to those around them.",
    biblicalReference:
      "Isaiah 11:2 - 'The Spirit of wisdom and of understanding, the Spirit of counsel and of might, the Spirit of the knowledge and fear of the Lord.'",
  },
  "5": {
    meaning:
      "The Outer Personality Number 5 gives off an energetic, adventurous, and adaptable exterior. Individuals with this number are seen as free spirits who embrace change and seek excitement. They appear charismatic, dynamic, and eager to explore new experiences. Biblically, 5 represents God's grace and transformation. People with this number are often perceived as spontaneous and unconventional, bringing a fresh perspective wherever they go.",
    biblicalReference: "Deuteronomy 5:6-21 - The Five Books of Moses and the Ten Commandments.",
  },
  "6": {
    meaning:
      "The Outer Personality Number 6 reflects a nurturing, compassionate, and responsible nature. Individuals with this number are perceived as caregivers, always putting the needs of others before their own. They exude warmth, empathy, and a desire to create harmony in their surroundings. Biblically, 6 is associated with human responsibility and divine creation. Those with this number appear gentle and loving, embodying a sense of protection and care.",
    biblicalReference:
      "Genesis 1:31 - 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.'",
  },
  "7": {
    meaning:
      "The Outer Personality Number 7 gives off a deep, mysterious, and introspective presence. Individuals with this number are perceived as wise, thoughtful, and spiritual. They may seem reserved or detached but carry an air of inner knowledge and contemplation. Biblically, 7 represents divine perfection and spiritual insight. People with this number often appear as seekers of truth, drawing others to them with their wisdom.",
    biblicalReference:
      "Genesis 2:2 - 'By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work.'",
  },
  "8": {
    meaning:
      "The Outer Personality Number 8 radiates confidence, ambition, and authority. Individuals with this number are perceived as powerful, goal-oriented, and success-driven. They carry an air of leadership and financial wisdom, often commanding respect in professional settings. Biblically, 8 represents new beginnings and divine renewal. Those with this number are seen as determined achievers who work hard to manifest their goals.",
    biblicalReference: "2 Peter 2:5 - Noah, the eighth person, a preacher of righteousness.",
  },
  "9": {
    meaning:
      "The Outer Personality Number 9 gives off a compassionate, wise, and humanitarian presence. Individuals with this number are seen as selfless, kind-hearted, and spiritually inclined. They exude a deep concern for the well-being of others and often carry an air of wisdom beyond their years. Biblically, 9 represents the fruits of the Spirit, reflecting divine love and grace. Those with this number appear as visionaries, driven by a desire to serve humanity.",
    biblicalReference: "Galatians 5:22-23 - The nine fruits of the Spirit.",
  },
  "11": {
    meaning: "People perceive you as inspirational, intuitive, and visionary.",
    biblicalReference:
      "Joel 2:28 - 'And afterward, I will pour out my Spirit on all people. Your sons and daughters will prophesy, your old men will dream dreams, your young men will see visions.'",
  },
  "22": {
    meaning: "Others see you as a master builder with the ability to manifest grand visions.",
    biblicalReference:
      "1 Chronicles 28:20 - David's charge to Solomon to build the temple, emphasizing the grand vision and practical execution.",
  },
  "33": {
    meaning: "You appear as a compassionate teacher and selfless server to others.",
    biblicalReference: "John 13:14-15 - Jesus washing the disciples' feet, exemplifying selfless service and teaching.",
  },
}

export const lifeLessonNumberDefinitions: { [key: string]: NumerologyDefinition } = {
  "1": {
    meaning:
      "The Life Lesson Number 1 teaches the importance of independence, self-reliance, and leadership. Individuals with this number must learn to take initiative, build confidence, and trust their instincts. Their journey involves stepping forward boldly, embracing challenges, and overcoming fear to achieve their true potential. Biblically, 1 signifies divine power and new beginnings, reminding individuals to trust in God's plan for their lives.",
    biblicalReference: "Genesis 1:1 - 'In the beginning, God created the heavens and the earth.'",
  },
  "2": {
    meaning:
      "The Life Lesson Number 2 teaches the value of patience, diplomacy, and cooperation. People with this number must learn how to work harmoniously with others, resolve conflicts peacefully, and develop emotional intelligence. Their journey involves embracing humility, practicing active listening, and recognizing the strength in unity. Biblically, 2 represents partnerships and faith in divine timing, reinforcing the importance of companionship and trust.",
    biblicalReference: "Ecclesiastes 4:9 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "3": {
    meaning:
      "The Life Lesson Number 3 focuses on self-expression, creativity, and optimism. Individuals with this number must learn how to use their talents to inspire and uplift others. Their journey involves developing confidence in their voice, embracing joy, and spreading positivity through communication. Biblically, 3 signifies divine completeness, reminding individuals that their gifts are meant to glorify God and bring light to the world.",
    biblicalReference: "Ecclesiastes 4:12 - 'A cord of three strands is not quickly broken.'",
  },
  "4": {
    meaning:
      "The Life Lesson Number 4 teaches discipline, structure, and perseverance. Those with this number must learn the importance of diligence, hard work, and building strong foundations. Their journey involves overcoming obstacles through persistence, maintaining integrity, and creating stability in all areas of life. Biblically, 4 symbolizes order and divine wisdom, reminding individuals that their efforts will bear fruit when built on faith.",
    biblicalReference:
      "Isaiah 11:2 - 'The Spirit of wisdom and of understanding, the Spirit of counsel and of might, the Spirit of the knowledge and fear of the Lord.'",
  },
  "5": {
    meaning:
      "The Life Lesson Number 5 emphasizes freedom, adaptability, and embracing change. Individuals with this number must learn to release fear, welcome new opportunities, and trust in divine guidance through life's uncertainties. Their journey involves experiencing different perspectives, taking risks, and maintaining spiritual alignment amidst change. Biblically, 5 represents grace and transformation, reminding individuals that God's plan unfolds through every season of life.",
    biblicalReference: "Deuteronomy 5:6-21 - The Five Books of Moses and the Ten Commandments.",
  },
  "6": {
    meaning:
      "The Life Lesson Number 6 teaches the importance of responsibility, service, and love. People with this number must learn how to care for others, balance self-care with helping those in need, and create harmony in relationships. Their journey involves accepting obligations with grace, showing compassion, and cultivating a heart of service. Biblically, 6 represents human responsibility and divine creation, emphasizing the role of stewardship in life.",
    biblicalReference:
      "Genesis 1:31 - 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.'",
  },
  "7": {
    meaning:
      "The Life Lesson Number 7 focuses on spiritual awakening, inner wisdom, and trust in divine timing. Individuals with this number must learn to seek truth, deepen their understanding, and cultivate faith in unseen forces. Their journey involves meditation, reflection, and finding peace in solitude. Biblically, 7 represents divine completion, reminding individuals that true wisdom comes from a relationship with God.",
    biblicalReference:
      "Genesis 2:2 - 'By the seventh day God had finished the work he had been doing; so on the seventh day he rested from all his work.'",
  },
  "8": {
    meaning:
      "The Life Lesson Number 8 teaches lessons of power, abundance, and responsible leadership. Individuals with this number must learn to balance material success with spiritual integrity. Their journey involves understanding the true meaning of wealth, using influence wisely, and ensuring that their ambitions align with divine purpose. Biblically, 8 signifies new beginnings, reminding individuals that prosperity must be used for good and guided by faith.",
    biblicalReference: "2 Peter 2:5 - Noah, the eighth person, a preacher of righteousness.",
  },
  "9": {
    meaning:
      "The Life Lesson Number 9 focuses on compassion, wisdom, and selfless service. Those with this number must learn to let go of past wounds, embrace forgiveness, and dedicate themselves to humanitarian causes. Their journey involves developing universal love, practicing humility, and using their experiences to uplift others. Biblically, 9 represents the fruits of the Spirit, reminding individuals that a life of service leads to spiritual fulfillment.",
    biblicalReference: "Galatians 5:22-23 - The nine fruits of the Spirit.",
  },
  "11": {
    meaning: "You are here to learn about spiritual insight, inspiration, and illumination.",
    biblicalReference: "Daniel 2:19 - Daniel receives divine insight and wisdom in a vision.",
  },
  "22": {
    meaning: "Your lesson is to learn how to turn big dreams into practical realities for the benefit of humanity.",
    biblicalReference:
      "Genesis 41 - Joseph interprets Pharaoh's dreams and implements a plan to save Egypt from famine.",
  },
  "33": {
    meaning: "You are learning about selfless service, spiritual upliftment, and compassionate teaching.",
    biblicalReference: "John 13:1-17 - Jesus washes his disciples' feet, demonstrating humble service and teaching.",
  },
}

export const personalNumberVibrationDefinitions: PersonalNumberVibration = {
  "10": {
    meaning:
      "The Personal Number Vibration 10 combines the pioneering energy of 1 with the infinite potential of 0. This vibration calls for leadership and new beginnings, guided by spiritual insight. Individuals with this number often find themselves at the forefront of innovative projects or ideas, inspired by divine wisdom. They are encouraged to trust their intuition and step boldly into new territories of personal and spiritual growth.",
    biblicalReference:
      "Isaiah 43:19 - 'See, I am doing a new thing! Now it springs up; do you not perceive it? I am making a way in the wilderness and streams in the wasteland.'",
  },
  "11": {
    meaning:
      "As a master number, the Personal Number Vibration 11 resonates with high spiritual energy and intuitive power. This vibration often manifests as a bridge between the earthly and the divine. Those with this number may experience heightened sensitivity, spiritual insights, and a calling to inspire others. They are challenged to maintain balance while serving a higher purpose.",
    biblicalReference:
      "Joel 2:28 - 'And afterward, I will pour out my Spirit on all people. Your sons and daughters will prophesy, your old men will dream dreams, your young men will see visions.'",
  },
  "12": {
    meaning:
      "The Personal Number Vibration 12 blends the creative energy of 1 with the harmonious nature of 2. This vibration often indicates a life path of inspired leadership and cooperative endeavors. Individuals with this number may find themselves in roles that require both initiative and diplomacy, possibly in fields related to education, spirituality, or community service.",
    biblicalReference:
      "1 Corinthians 12:12 - 'Just as a body, though one, has many parts, but all its many parts form one body, so it is with Christ.'",
  },
  "13": {
    meaning:
      "Often misunderstood, the Personal Number Vibration 13 is a powerful number of transformation and rebirth. It combines the pioneering energy of 1 with the creative force of 3. Those with this vibration may experience significant life changes that lead to personal and spiritual growth. They are called to embrace change with faith and courage.",
    biblicalReference:
      "2 Corinthians 5:17 - 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!'",
  },
  "14": {
    meaning:
      "The Personal Number Vibration 14 merges the initiative of 1 with the stability of 4. This vibration often indicates a path of practical creativity and disciplined self-expression. Individuals with this number may excel in fields that require both innovation and structure, such as architecture, engineering, or organizational leadership.",
    biblicalReference:
      "Exodus 35:30-31 - 'Then Moses said to the Israelites, \"See, the Lord has chosen Bezalel son of Uri, the son of Hur, of the tribe of Judah, and he has filled him with the Spirit of God, with wisdom, with understanding, with knowledge and with all kinds of skills.\"'",
  },
  "15": {
    meaning:
      "The Personal Number Vibration 15 combines the leadership of 1 with the adaptability of 5. This vibration often indicates a life path filled with dynamic changes and opportunities for personal freedom. Those with this number may be called to lead others through periods of transformation, teaching flexibility and the embrace of new experiences.",
    biblicalReference:
      "Joshua 1:9 - 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.'",
  },
  "16": {
    meaning:
      "The Personal Number Vibration 16 blends the initiative of 1 with the nurturing energy of 6. This vibration often indicates a path of responsible leadership and service to others. Individuals with this number may find themselves in roles that require both assertiveness and compassion, possibly in fields related to counseling, healthcare, or community development.",
    biblicalReference:
      "1 Peter 4:10 - 'Each of you should use whatever gift you have received to serve others, as faithful stewards of God's grace in its various forms.'",
  },
  "17": {
    meaning:
      "The Personal Number Vibration 17 combines the pioneering spirit of 1 with the spiritual wisdom of 7. This vibration often indicates a life path of spiritual leadership and inspired analysis. Those with this number may be drawn to fields that blend innovation with deep understanding, such as scientific research, spiritual teaching, or philosophical inquiry.",
    biblicalReference:
      "Proverbs 9:10 - 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.'",
  },
  "18": {
    meaning:
      "The Personal Number Vibration 18 merges the leadership of 1 with the material mastery of 8. This vibration often indicates a path of ambitious achievement and responsible power. Individuals with this number may be called to lead significant projects or organizations, balancing material success with spiritual integrity.",
    biblicalReference:
      "Deuteronomy 8:18 - 'But remember the Lord your God, for it is he who gives you the ability to produce wealth, and so confirms his covenant, which he swore to your ancestors, as it is today.'",
  },
  "19": {
    meaning:
      "The Personal Number Vibration 19 blends the initiative of 1 with the humanitarian energy of 9. This vibration often indicates a life path of inspired leadership in service of humanity. Those with this number may be drawn to roles that allow them to initiate projects or movements that benefit the greater good, possibly in fields related to social justice, environmental protection, or global cooperation.",
    biblicalReference:
      "Matthew 5:16 - 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.'",
  },
  "20": {
    meaning:
      "The Personal Number Vibration 20 amplifies the cooperative and intuitive qualities of 2. This vibration often indicates a life path focused on partnerships, diplomacy, and spiritual insight. Individuals with this number may excel in roles that require deep empathy, mediation skills, and the ability to see multiple perspectives.",
    biblicalReference:
      "Ecclesiastes 4:9-10 - 'Two are better than one, because they have a good return for their labor: If either of them falls down, one can help the other up.'",
  },
  "21": {
    meaning:
      "The Personal Number Vibration 21 combines the intuition of 2 with the creativity of 1. This vibration often indicates a path of inspired cooperation and innovative partnerships. Those with this number may find success in collaborative creative endeavors or in roles that require both teamwork and original thinking.",
    biblicalReference:
      "Ephesians 2:10 - 'For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.'",
  },
  "22": {
    meaning:
      "As a master number, the Personal Number Vibration 22 resonates with the energy of the master builder. This vibration often manifests as the ability to turn grand visions into practical realities. Those with this number may be called to create structures, systems, or organizations that benefit humanity on a large scale.",
    biblicalReference: "Genesis 1:1 - 'In the beginning God created the heavens and the earth.'",
  },
  "23": {
    meaning:
      "The Personal Number Vibration 23 blends the cooperative energy of 2 with the creative expression of 3. This vibration often indicates a life path of harmonious creativity and joyful collaboration. Individuals with this number may excel in fields that require both teamwork and artistic expression, such as performing arts, collaborative design, or community art projects.",
    biblicalReference:
      "Psalm 150:3-5 - 'Praise him with the sounding of the trumpet, praise him with the harp and lyre, praise him with timbrel and dancing, praise him with the strings and pipe, praise him with the clash of cymbals, praise him with resounding cymbals.'",
  },
  "24": {
    meaning:
      "The Personal Number Vibration 24 combines the intuitive cooperation of 2 with the practical stability of 4. This vibration often indicates a path of building harmonious and lasting structures, both in relationships and in the material world. Those with this number may be drawn to fields that require both teamwork and organizational skills.",
    biblicalReference:
      "1 Chronicles 28:20 - 'David also said to Solomon his son, \"Be strong and courageous, and do the work. Do not be afraid or discouraged, for the Lord God, my God, is with you. He will not fail you or forsake you until all the work for the service of the temple of the Lord is finished.\"'",
  },
  "25": {
    meaning:
      "The Personal Number Vibration 25 merges the cooperative nature of 2 with the adventurous spirit of 5. This vibration often indicates a life path of adaptable partnerships and exciting collaborations. Individuals with this number may thrive in dynamic team environments or in roles that require both diplomacy and a love for new experiences.",
    biblicalReference: "Proverbs 27:17 - 'As iron sharpens iron, so one person sharpens another.'",
  },
  "26": {
    meaning:
      "The Personal Number Vibration 26 blends the intuitive cooperation of 2 with the nurturing responsibility of 6. This vibration often indicates a path of harmonious service and compassionate teamwork. Those with this number may be drawn to roles in counseling, family services, or community care, where they can use their empathetic nature to support others.",
    biblicalReference:
      "Galatians 6:2 - 'Carry each other's burdens, and in this way you will fulfill the law of Christ.'",
  },
  "27": {
    meaning:
      "The Personal Number Vibration 27 combines the intuitive cooperation of 2 with the spiritual wisdom of 7. This vibration often indicates a life path of spiritual partnerships and intuitive understanding. Individuals with this number may excel in roles thatblend teamwork with deep insight, such as spiritual counseling, collaborative research, or intuitive healing practices.",
    biblicalReference:
      "Ecclesiastes 4:12 - 'Though one may be overpowered, two can defend themselves. A cord of three strands is not quickly broken.'",
  },
  "28": {
    meaning:
      "The Personal Number Vibration 28 merges thecooperative energyof 2 with the material mastery of 8. This vibration often indicates a path of successful partnerships and collaborative achievements. Those with this number may be drawn to business partnerships, joint ventures, or roles that require both teamwork and financial acumen.",
    biblicalReference:
      "Deuteronomy 8:18 - 'But remember the Lord your God, for it is he who gives you the ability to produce wealth, and so confirms his covenant, which he swore to your ancestors, as it is today.'",
  },
  "29": {
    meaning:
      "The Personal Number Vibration 29 blends the intuitive cooperation of 2 with the humanitarian energy of 9. This vibration often indicates a life path of compassionate partnerships and global awareness. Individuals with this number may be called to work in international relations, cross-cultural understanding, or collaborative humanitarian efforts.",
    biblicalReference:
      "Matthew 25:40 - 'The King will reply, \"Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me.\"'",
  },
  "30": {
    meaning:
      "The Personal Number Vibration 30 amplifies the creative and expressive qualities of 3. This vibration often indicates a life path focused on joyful self-expression and inspiring communication. Those with this number may excel in fields related to the arts, public speaking, or any area where they can use their creativity to uplift and motivate others.",
    biblicalReference:
      "Exodus 35:35 - 'He has filled them with skill to do all kinds of work as engravers, designers, embroiderers in blue, purple and scarlet yarn and fine linen, and weavers—all of them skilled workers and designers.'",
  },
  "31": {
    meaning:
      "The Personal Number Vibration 31 combines the creative energy of 3 with the pioneering spirit of 1. This vibration often indicates a path of innovative self-expression and original artistry. Individuals with this number may be drawn to avant-garde art forms, groundbreaking performances, or pioneering creative projects.",
    biblicalReference:
      "Exodus 31:3-5 - 'And I have filled him with the Spirit of God, with wisdom, with understanding, with knowledge and with all kinds of skills— to make artistic designs for work in gold, silver and bronze, to cut and set stones, to work in wood, and to engage in all kinds of crafts.'",
  },
  "32": {
    meaning:
      "The Personal Number Vibration 32 blends the creative expression of 3 with the cooperative nature of 2. This vibration often indicates a life path of collaborative creativity and harmonious artistry. Those with this number may excel in team-based creative projects, collaborative performances, or roles that require both artistic talent and interpersonal skills.",
    biblicalReference:
      "1 Chronicles 25:1 - 'David, together with the commanders of the army, set apart some of the sons of Asaph, Heman and Jeduthun for the ministry of prophesying, accompanied by harps, lyres and cymbals.'",
  },
  "33": {
    meaning:
      "As a master number, the Personal Number Vibration 33 resonates with the energy of the master teacher. This vibration often manifests as a profound ability to nurture, guide, and inspire others. Those with this number may be called to roles that allow them to uplift humanity through compassionate teaching, healing, or spiritual leadership.",
    biblicalReference:
      "Matthew 5:14-16 - 'You are the light of the world. A town built on a hill cannot be hidden. Neither do people light a lamp and put it under a bowl. Instead they put it on its stand, and it gives light to everyone in the house. In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.'",
  },
  "78": {
    meaning:
      "The Personal Number Vibration 78 combines the spiritual wisdom of 7 with the material mastery of 8. This vibration often indicates a life path that balances spiritual insight with practical achievement. Individuals with this number may be called to use their intuitive understanding to create material abundance, not just for themselves but for the benefit of others. They may excel in roles that bridge the spiritual and material worlds, such as conscious business leadership or philanthropic endeavors.",
    biblicalReference:
      "Proverbs 3:13-14 - 'Blessed are those who find wisdom, those who gain understanding, for she is more profitable than silver and yields better returns than gold.'",
  },
  "34": {
    meaning:
      "The Personal Number Vibration 34 combines the creative expression of 3 with the practical foundation of 4. This vibration often indicates a path where artistic vision meets methodical execution. Those with this number may excel in fields that require both creative innovation and structural discipline, such as architectural design, product development, or educational program creation.",
    biblicalReference:
      "Exodus 31:1-3 - 'The Lord said to Moses, \"See, I have chosen Bezalel... and I have filled him with the Spirit of God, with wisdom, with understanding, with knowledge and with all kinds of skills.\"'",
  },
  "35": {
    meaning:
      "The Personal Number Vibration 35 merges the creative energy of 3 with the adventurous spirit of 5. This vibration often indicates a path of dynamic self-expression and versatile communication. Individuals with this number may thrive in roles that combine artistic expression with freedom of movement, such as traveling performers, creative entrepreneurs, or innovative teachers.",
    biblicalReference:
      "Psalm 96:1-3 - 'Sing to the Lord a new song; sing to the Lord, all the earth. Sing to the Lord, praise his name; proclaim his salvation day after day.'",
  },
  "36": {
    meaning:
      "The Personal Number Vibration 36 blends the creative force of 3 with the nurturing energy of 6. This vibration often indicates a path of artistic service and creative caregiving. Those with this number may excel in roles that allow them to use their creative gifts to help and heal others, such as art therapy, music education, or creative counseling.",
    biblicalReference:
      "Exodus 35:35 - 'He has filled them with skill to do all kinds of work as engravers, designers, embroiderers in blue, purple and scarlet yarn and fine linen, and weavers—all of them skilled workers and designers.'",
  },
  "37": {
    meaning:
      "The Personal Number Vibration 37 combines the expressive energy of 3 with the spiritual wisdom of 7. This vibration often indicates a path of inspired creativity and spiritual artistry. Individuals with this number may be drawn to roles that blend artistic expression with spiritual insight, such as sacred music, spiritual writing, or visionary art.",
    biblicalReference:
      "Psalm 49:3-4 - 'My mouth will speak words of wisdom; the meditation of my heart will give you understanding. I will turn my ear to a proverb; I will expound my riddle on the harp.'",
  },
  "38": {
    meaning:
      "The Personal Number Vibration 38 merges the creative power of 3 with the material mastery of 8. This vibration often indicates a path of profitable creativity and successful artistic ventures. Those with this number may excel in roles that combine artistic talent with business acumen, such as creative direction, entertainment production, or arts management.",
    biblicalReference: "1 Chronicles 29:5 - 'Now, who is willing to consecrate themselves to the Lord today?'",
  },
  "39": {
    meaning:
      "The Personal Number Vibration 39 blends the creative expression of 3 with the humanitarian energy of 9. This vibration often indicates a path of artistic service to humanity. Individuals with this number may be called to use their creative gifts for the greater good, such as through charitable arts programs, cultural preservation, or healing through creativity.",
    biblicalReference:
      "Psalm 108:3-4 - 'I will praise you, Lord, among the nations; I will sing of you among the peoples. For great is your love, higher than the heavens; your faithfulness reaches to the skies.'",
  },
  "40": {
    meaning:
      "The Personal Number Vibration 40 amplifies the foundational and practical qualities of 4. This vibration often indicates a path of building solid structures and systems. Those with this number may excel in roles that require careful planning and methodical execution, with an emphasis on creating lasting results.",
    biblicalReference:
      "Genesis 7:4 - 'Seven days from now I will send rain on the earth for forty days and forty nights.'",
  },
  "41": {
    meaning:
      "The Personal Number Vibration 41 combines the stable energy of 4 with the pioneering spirit of 1. This vibration often indicates a path of structured leadership and practical innovation. Individuals with this number may excel in roles that require both methodical planning and bold initiative.",
    biblicalReference:
      "Isaiah 28:16 - 'See, I lay a stone in Zion, a tested stone, a precious cornerstone for a sure foundation.'",
  },
  "42": {
    meaning:
      "The Personal Number Vibration 42 blends the practical energy of 4 with the cooperative nature of 2. This vibration often indicates a path of structured partnership and organized collaboration. Those with this number may thrive in roles that combine systematic approaches with teamwork.",
    biblicalReference:
      "Ecclesiastes 4:9-10 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "43": {
    meaning:
      "The Personal Number Vibration 43 merges the foundational energy of 4 with the creative expression of 3. This vibration often indicates a path of structured creativity and practical artistry. Individuals with this number may excel in roles that require both technical skill and creative vision.",
    biblicalReference:
      "1 Chronicles 28:11-12 - 'Then David gave his son Solomon the plans for the portico of the temple, its buildings, its storerooms, its upper parts, its inner rooms and the place of atonement.'",
  },
  "44": {
    meaning:
      "The Personal Number Vibration 44 amplifies the practical and foundational qualities of 4. This vibration often indicates a path of master building and practical achievement. Those with this number may be called to create lasting structures and systems that benefit others.",
    biblicalReference:
      "1 Kings 6:7 - 'In building the temple, only blocks dressed at the quarry were used, and no hammer, chisel or any other iron tool was heard at the temple site while it was being built.'",
  },
  "45": {
    meaning:
      "The Personal Number Vibration 45 combines the stable energy of 4 with the adventurous spirit of 5. This vibration often indicates a path of structured freedom and practical adaptation. Individuals with this number may excel in roles that require both systematic planning and flexibility.",
    biblicalReference:
      "Joshua 1:8-9 - 'Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it.'",
  },
  "46": {
    meaning:
      "The Personal Number Vibration 46 blends the practical energy of 4 with the nurturing qualities of 6. This vibration often indicates a path of structured service and practical caregiving. Those with this number may thrive in roles that combine organizational skills with compassionate care.",
    biblicalReference:
      "Nehemiah 4:6 - 'So we rebuilt the wall till all of it reached half its height, for the people worked with all their heart.'",
  },
  "47": {
    meaning:
      "The Personal Number Vibration 47 merges the foundational energy of 4 with the spiritual wisdom of 7. This vibration often indicates a path of practical spirituality and grounded wisdom. Individuals with this number may excel in roles that bridge the practical and spiritual realms.",
    biblicalReference:
      "Proverbs 24:3-4 - 'By wisdom a house is built, and through understanding it is established; through knowledge its rooms are filled with rare and beautiful treasures.'",
  },
  "48": {
    meaning:
      "The Personal Number Vibration 48 combines the stable energy of 4 with the material mastery of 8. This vibration often indicates a path of practical achievement and structured success. Those with this number may be called to build lasting material prosperity through methodical effort.",
    biblicalReference:
      "Proverbs 21:5 - 'The plans of the diligent lead to profit as surely as haste leads to poverty.'",
  },
  "49": {
    meaning:
      "The Personal Number Vibration 49 blends the practical energy of 4 with the humanitarian qualities of 9. This vibration often indicates a path of structured service to humanity. Individuals with this number may excel in organizing and implementing programs that benefit others.",
    biblicalReference:
      "Isaiah 58:12 - 'Your people will rebuild the ancient ruins and will raise up the age-old foundations.'",
  },
  "50": {
    meaning:
      "The Personal Number Vibration 50 amplifies the adventurous and adaptable qualities of 5. This vibration often indicates a path of significant change and personal freedom. Those with this number may be called to embrace and guide others through transformation.",
    biblicalReference:
      "2 Corinthians 5:17 - 'Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!'",
  },
  "51": {
    meaning:
      "The Personal Number Vibration 51 combines the adaptable energy of 5 with the pioneering spirit of 1. This vibration often indicates a path of innovative change and adventurous leadership. Individuals with this number may excel in roles that require both flexibility and initiative.",
    biblicalReference: "Isaiah 43:19 - 'See, I am doing a new thing! Now it springs up; do you not perceive it?'",
  },
  "52": {
    meaning:
      "The Personal Number Vibration 52 blends the freedom-loving energy of 5 with the cooperative nature of 2. This vibration often indicates a path of adaptable partnership and flexible collaboration. Those with this number may thrive in roles that combine teamwork with variety.",
    biblicalReference: "Ruth 1:16 - 'Where you go I will go, and where you stay I will stay.'",
  },
  "53": {
    meaning:
      "The Personal Number Vibration 53 merges the adventurous spirit of 5 with creative expression of 3. This vibration often indicates a path of creative freedom and expressive change. Individuals with this number may excel in roles that allow for both artistic expression and personal freedom.",
    biblicalReference: "Psalm 98:1 - 'Sing to the Lord a new song, for he has done marvelous things.'",
  },
  "54": {
    meaning:
      "The Personal Number Vibration 54 combines the adaptable energy of 5 with the practical foundation of 4. This vibration often indicates a path of structured freedom and practical adaptation. Those with this number may be called to build flexible systems and adaptable structures.",
    biblicalReference: "1 Corinthians 3:10 - 'By the grace God has given me, I laid a foundation as a wise builder.'",
  },
  "55": {
    meaning:
      "The Personal Number Vibration 55 amplifies the adventurous and freedom-seeking qualities of 5. This vibration often indicates a path of significant personal freedom and transformative change. Individuals with this number may be called to be agents of change and transformation.",
    biblicalReference:
      "Isaiah 40:31 - 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles.'",
  },
  "56": {
    meaning:
      "The Personal Number Vibration 56 blends the adaptable energy of 5 with the nurturing qualities of 6. This vibration often indicates a path of flexible service and adaptable caregiving. Those with this number may excel in roles that require both responsiveness and responsibility.",
    biblicalReference: "Galatians 5:13 - 'Serve one another humbly in love.'",
  },
  "57": {
    meaning:
      "The Personal Number Vibration 57 merges the freedom-loving energy of 5 with the spiritual wisdom of 7. This vibration often indicates a path of spiritual freedom and intuitive adaptation. Individuals with this number may be drawn to explore various spiritual paths and share their insights.",
    biblicalReference: "John 8:32 - 'Then you will know the truth, and the truth will set you free.'",
  },
  "58": {
    meaning:
      "The Personal Number Vibration 58 combines the adaptable energy of 5 with the material mastery of 8. This vibration often indicates a path of flexible achievement and adaptable success. Those with this number may excel in creating prosperity through embracing change.",
    biblicalReference: "Philippians 4:12-13 - 'I have learned the secret of being content in any and every situation.'",
  },
  "59": {
    meaning:
      "The Personal Number Vibration 59 blends the freedom-seeking energy of 5 with the humanitarian qualities of 9. This vibration often indicates a path of transformative service to humanity. Individuals with this number may be called to facilitate positive change in society.",
    biblicalReference:
      "Isaiah 61:1 - 'The Spirit of the Sovereign Lord is on me, because the Lord has anointed me to proclaim good news to the poor.'",
  },
  "60": {
    meaning:
      "The Personal Number Vibration 60 amplifies the nurturing and responsible qualities of 6. This vibration often indicates a path of enhanced service and caregiving. Those with this number may be called to significant roles in supporting and nurturing others.",
    biblicalReference: "1 Peter 4:10 - 'Each of you should use whatever gift you have received to serve others.'",
  },
  "61": {
    meaning:
      "The Personal Number Vibration 61 combines the nurturing energy of 6 with the pioneering spirit of 1. This vibration often indicates a path of innovative service and leadership in caregiving. Individuals with this number may excel in creating new ways to help others.",
    biblicalReference: "Matthew 20:26 - 'Whoever wants to become great among you must be your servant.'",
  },
  "62": {
    meaning:
      "The Personal Number Vibration 62 blends the responsible energy of 6 with the cooperative nature of 2. This vibration often indicates a path of harmonious service and collaborative caregiving. Those with this number may thrive in roles that combine teamwork with nurturing.",
    biblicalReference: "Romans 12:10 - 'Be devoted to one another in love. Honor one another above yourselves.'",
  },
  "63": {
    meaning:
      "The Personal Number Vibration 63 merges the nurturing qualities of 6 with creative expression of 3. This vibration often indicates a path of creative service and artistic caregiving. Individuals with this number may excel in using creative methods to help and heal others.",
    biblicalReference: "Exodus 35:35 - 'He has filled them with skill to do all kinds of work.'",
  },
  "64": {
    meaning:
      "The Personal Number Vibration 64 combines the responsible energy of 6 with the practical foundation of 4. This vibration often indicates a path of structured service and practical caregiving. Those with this number may be called to build stable systems of support for others.",
    biblicalReference: "Proverbs 14:1 - 'The wise woman builds her house.'",
  },
  "65": {
    meaning:
      "The Personal Number Vibration 65 blends the nurturing energy of 6 with the adaptable spirit of 5. This vibration often indicates a path of flexible service and adaptable caregiving. Individuals with this number may excel in providing care that adapts to changing needs.",
    biblicalReference:
      "1 Corinthians 9:22 - 'I have become all things to all people so that by all possible means I might save some.'",
  },
  "66": {
    meaning:
      "The Personal Number Vibration 66 amplifies the nurturing and responsible qualities of 6. This vibration often indicates a path of heightened service and deep commitment to others. Those with this number may be called to significant roles in healing and caregiving.",
    biblicalReference:
      "Galatians 6:2 - 'Carry each other's burdens, and in this way you will fulfill the law of Christ.'",
  },
  "67": {
    meaning:
      "The Personal Number Vibration 67 merges the nurturing energy of 6 with the spiritual wisdom of 7. This vibration often indicates a path of spiritual service and intuitive caregiving. Individuals with this number may excel in roles that combine spiritual guidance with practical support.",
    biblicalReference: "1 Peter 4:11 - 'If anyone serves, they should do so with the strength God provides.'",
  },
  "68": {
    meaning:
      "The Personal Number Vibration 68 combines the responsible energy of 6 with the material mastery of 8. This vibration often indicates a path of practical service and material support. Those with this number may be called to use their resources to help others.",
    biblicalReference: "Acts 20:35 - 'It is more blessed to give than to receive.'",
  },
  "69": {
    meaning:
      "The Personal Number Vibration 69 blends the nurturing qualities of 6 with the humanitarian energy of 9. This vibration often indicates a path of universal service and compassionate care for humanity. Individuals with this number may be drawn to global humanitarian efforts.",
    biblicalReference:
      "Matthew 25:40 - 'Whatever you did for one of the least of these brothers and sisters of mine, you did for me.'",
  },
  "70": {
    meaning:
      "The Personal Number Vibration 70 amplifies the spiritual and analytical qualities of 7. This vibration often indicates a path of enhanced spiritual wisdom and deep understanding. Those with this number may be called to significant roles in spiritual teaching or research.",
    biblicalReference:
      "Daniel 1:17 - 'God gave these four young men knowledge and understanding of all kinds of literature and learning.'",
  },
  "71": {
    meaning:
      "The Personal Number Vibration 71 combines the spiritual energy of 7 with the pioneering spirit of 1. This vibration often indicates a path of spiritual leadership and innovative wisdom. Individuals with this number may excel in breaking new ground in spiritual understanding.",
    biblicalReference:
      "Isaiah 30:21 - 'Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, \"This is the way; walk in it.\"'",
  },
  "72": {
    meaning:
      "The Personal Number Vibration 72 blends the spiritual wisdom of 7 with the cooperative nature of 2. This vibration often indicates a path of shared spiritual insight and collaborative understanding. Those with this number may thrive in spiritual partnerships.",
    biblicalReference:
      "Ecclesiastes 4:9-10 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "73": {
    meaning:
      "The Personal Number Vibration 73 merges the spiritual energy of 7 with creative expression of 3. This vibration often indicates a path of inspired wisdom and creative spirituality. Individuals with this number may excel in expressing spiritual truths through creative means.",
    biblicalReference:
      "Psalm 49:3 - 'My mouth will speak words of wisdom; the meditation of my heart will give you understanding.'",
  },
  "74": {
    meaning:
      "The Personal Number Vibration 74 combines the spiritual wisdom of 7 with the practical foundation of 4. This vibration often indicates a path of practical spirituality and grounded wisdom. Those with this number may be called to build practical applications of spiritual principles.",
    biblicalReference: "Proverbs 24:3-4 - 'By wisdom a house is built, and through understanding it is established.'",
  },
  "75": {
    meaning:
      "The Personal Number Vibration 75 blends the spiritual energy of 7 with the adaptable spirit of 5. This vibration often indicates a path of evolving wisdom and adaptable spirituality. Individuals with this number may excel in helping others navigate spiritual changes.",
    biblicalReference:
      "Romans 12:2 - 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.'",
  },
  "76": {
    meaning:
      "The Personal Number Vibration 76 merges the spiritual wisdom of 7 with the nurturing energy of 6. This vibration often indicates a path of spiritual service and compassionate wisdom. Those with this number may be called to nurture others' spiritual growth.",
    biblicalReference: "1 Thessalonians 5:11 - 'Therefore encourage one another and build each other up.'",
  },
  "77": {
    meaning:
      "The Personal Number Vibration 77 amplifies the spiritual and mystical qualities of 7. This vibration often indicates a path of deep spiritual wisdom and profound understanding. Individuals with this number may be called to significant spiritual revelation and teaching.",
    biblicalReference:
      "Daniel 2:22 - 'He reveals deep and hidden things; he knows what lies in darkness, and light dwells with him.'",
  },
  "79": {
    meaning:
      "The Personal Number Vibration 79 blends the spiritual wisdom of 7 with the humanitarian energy of 9. This vibration often indicates a path of spiritual service to humanity. Those with this number may be called to share spiritual wisdom for the benefit of all.",
    biblicalReference:
      "Isaiah 11:9 - 'For the earth will be filled with the knowledge of the Lord as the waters cover the sea.'",
  },
  "80": {
    meaning:
      "The Personal Number Vibration 80 amplifies the material mastery and power of 8. This vibration often indicates a path of enhanced material achievement and influence. Individuals with this number may be called to create significant material abundance.",
    biblicalReference:
      "Deuteronomy 8:18 - 'Remember the Lord your God, for it is he who gives you the ability to produce wealth.'",
  },
  "81": {
    meaning:
      "The Personal Number Vibration 81 combines the material mastery of 8 with the pioneering spirit of 1. This vibration often indicates a path of innovative achievement and leadership in material matters. Those with this number may excel in creating new paths to success.",
    biblicalReference: "Joshua 1:8 - 'Then you will be prosperous and successful.'",
  },
  "82": {
    meaning:
      "The Personal Number Vibration 82 blends the material power of 8 with the cooperative nature of 2. This vibration often indicates a path of collaborative success and partnership in achievement. Individuals with this number may thrive in business partnerships.",
    biblicalReference: "Ecclesiastes 4:9 - 'Two are better than one, because they have a good return for their labor.'",
  },
  "83": {
    meaning:
      "The Personal Number Vibration 83 merges the material mastery of 8 with creative expression of 3. This vibration often indicates a path of creative success and artistic achievement. Those with this number may be called to create material success through creative endeavors.",
    biblicalReference:
      "Exodus 31:3-5 - 'I have filled him with the Spirit of God, with wisdom, with understanding, with knowledge and with all kinds of skills.'",
  },
  "84": {
    meaning:
      "The Personal Number Vibration 84 combines the material power of 8 with the practical foundation of 4. This vibration often indicates a path of structured success and methodical achievement. Individuals with this number may excel in building lasting material prosperity.",
    biblicalReference: "Proverbs 24:3-4 - 'By wisdom a house is built, and through understanding it is established.'",
  },
  "85": {
    meaning:
      "The Personal Number Vibration 85 blends the material mastery of 8 with the adaptable spirit of 5. This vibration often indicates a path of flexible achievement and adaptable success. Those with this number may thrive in dynamic business environments.",
    biblicalReference: "Philippians 4:12-13 - 'I have learned the secret of being content in any and every situation.'",
  },
  "86": {
    meaning:
      "The Personal Number Vibration 86 merges the material power of 8 with the nurturing energy of 6. This vibration often indicates a path of responsible success and service-oriented achievement. Individuals with this number may be called to use their success to help others.",
    biblicalReference: "Proverbs 11:25 - 'A generous person will prosper; whoever refreshes others will be refreshed.'",
  },
  "87": {
    meaning:
      "The Personal Number Vibration 87 combines the material mastery of 8 with the spiritual wisdom of 7. This vibration often indicates a path of spiritually guided success and enlightened achievement. Those with this number may excel in bridging material and spiritual realms.",
    biblicalReference:
      "3 John 1:2 - 'Dear friend, I pray that you may enjoy good health and that all may go well with you, even as your soul is getting along well.'",
  },
  "89": {
    meaning:
      "The Personal Number Vibration 89 blends the material power of 8 with the humanitarian energy of 9. This vibration often indicates a path of philanthropic success and achievement for the greater good. Individuals with this number may be called to use their success for humanitarian causes.",
    biblicalReference: "Acts 20:35 - 'It is more blessed to give than to receive.'",
  },
  "90": {
    meaning:
      "The Personal Number Vibration 90 amplifies the humanitarian and universal qualities of 9. This vibration often indicates a path of enhanced service to humanity and global consciousness. Those with this number may be called to significant humanitarian work.",
    biblicalReference: "Matthew 5:16 - 'Let your light shine before others, that they may see your good deeds.'",
  },
  "91": {
    meaning:
      "The Personal Number Vibration 91 combines the humanitarian energy of 9 with the pioneering spirit of 1. This vibration often indicates a path of innovative humanitarian leadership. Individuals with this number may excel in creating new approaches to helping humanity.",
    biblicalReference:
      "Isaiah 58:10 - 'If you spend yourselves in behalf of the hungry and satisfy the needs of the oppressed.'",
  },
  "92": {
    meaning:
      "The Personal Number Vibration 92 blends the universal love of 9 with the cooperative nature of 2. This vibration often indicates a path of collaborative humanitarian work. Those with this number may thrive in partnership-based charitable efforts.",
    biblicalReference: "Ecclesiastes 4:12 - 'A cord of three strands is not quickly broken.'",
  },
  "93": {
    meaning:
      "The Personal Number Vibration 93 merges the humanitarian energy of 9 with creative expression of 3. This vibration often indicates a path of creative service to humanity. Individuals with this number may be called to use artistic expression for humanitarian causes.",
    biblicalReference: "Psalm 98:1 - 'Sing to the Lord a new song, for he has done marvelous things.'",
  },
  "94": {
    meaning:
      "The Personal Number Vibration 94 combines the universal consciousness of 9 with the practical foundation of 4. This vibration often indicates a path of structured humanitarian service. Those with this number may excel in building practical systems for helping others.",
    biblicalReference: "Nehemiah 2:18 - 'Let us start rebuilding.'",
  },
  "95": {
    meaning:
      "The Personal Number Vibration 95 blends the humanitarian energy of 9 with the adaptable spirit of 5. This vibration often indicates a path of flexible service to humanity. Individuals with this number may thrive in dynamic humanitarian roles.",
    biblicalReference:
      "Isaiah 58:6 - 'Is not this the kind of fasting I have chosen: to loose the chains of injustice?'",
  },
  "96": {
    meaning:
      "The Personal Number Vibration 96 merges the universal love of 9 with the nurturing energy of 6. This vibration often indicates a path of compassionate service to humanity. Those with this number may be called to nurturing roles in humanitarian work.",
    biblicalReference:
      "1 John 3:17 - 'If anyone has material possessions and sees a brother or sister in need but has no pity on them, how can the love of God be in that person?'",
  },
  "97": {
    meaning:
      "The Personal Number Vibration 97 combines the humanitarian consciousness of 9 with the spiritual wisdom of 7. This vibration often indicates a path of spiritual service to humanity. Individuals with this number may excel in sharing spiritual wisdom for the benefit of all.",
    biblicalReference:
      "Micah 6:8 - 'And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.'",
  },
  "98": {
    meaning:
      "The Personal Number Vibration 98 blends the universal energy of 9 with the material mastery of 8. This vibration often indicates a path of material success used for humanitarian purposes. Those with this number may be called to create abundance for the greater good.",
    biblicalReference:
      "2 Corinthians 9:11 - 'You will be enriched in every way so that you can be generous on every occasion.'",
  },
  "99": {
    meaning:
      "The Personal Number Vibration 99 amplifies the humanitarian and universal qualities of 9. This vibration often indicates a path of complete dedication to serving humanity. Individuals with this number may be called to significant global service and universal love.",
    biblicalReference:
      "Matthew 25:40 - 'Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me.'",
  },
}

