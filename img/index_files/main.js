
var starSigObject = [
	{
		starSig: "Aquarius",
		dates : " January 20th - February 18th ",
		symbol: " img/sym/symAquarius.png ",
		starSigImg: "img/sig/aquarius.png",
		astrologicalReport:" Knowlage, Humanitarian, Seriouse, Insightfull, Duplicitous. "
	},

	{
		starSig: "Pisces",
		dates : " March 21st - February 19th ",
		symbol: "img/sym/symPisces.png",
		starSigImg: "img/sig/pisces.png",
		astrologicalReport: " Fluctuation, Depth, Imagination, Reactive, Indecisive. "
	},

	{
		starSig: "Aries",
		dates: " March 21st - April 19th ",
		symbol: "img/sym/symAries.png",
		starSigImg: "img/sig/aries.png",
		astrologicalReport: " Active, Demanding, Determined, Effective, Ambitious. " 
	},

	{
		starSig: "Taurus",
		dates: " April 20th - May 20th ",
		symbol: "img/sym/symTaurus.png",
		starSigImg: "img/sig/taurus.png",
		astrologicalReport: " Security, Subtle Strength, Appreciation, Instruction, Patinece. "
	},

	{
		starSig: "Gemini",
		dates: " May 21st - Jun 20th ",
		symbol: "img/sym/symGemini.png",
		starSigImg: "img/sig/gemini.png",
		astrologicalReport: " Communication, Indecision, Inquisitive, Intelligent, Changeable. "
	},

	{
		starSig: "Cancer",
		dates: " June 21st - July 22nd ",
		symbol: "img/sym/symCancer.png",
		starSigImg: "img/sig/cancer.png",
		astrologicalReport: " Emotion, Diplomatic, Intensity, Impulsive, Selective. "
	},

	{
		starSig: "Leo",
		dates: " July 23rd - August 22nd ",
		symbol: "img/sym/symLeo.png",
		starSigImg: "img/sig/leo.png",
		astrologicalReport: " Rulling, Warmth, Generoity, Faithfyl, Initiative. "
	},

	{
		starSig: "Virgo",
		dates: " August 23rd - September 22nd ",
		symbol: "img/sym/symVirgo.png",
		starSigImg: "img/sig/virgo.png",
		astrologicalReport: " Analyzing, Practical, Reflective, Obervation, Thoughtful. "
	},

	{
		starSig: "Libra",
		dates: " September 23rd - October 22nd ",
		symbol: "img/sym/symLibra.png",
		starSigImg: "img/sig/libra.png",
		astrologicalReport: " Balance, Justice, Truth, Beauty, Perfection. "
	},

	{
		starSig: "Scorpio",
		dates: " October 23 - Novermber 22nd ",
		symbol: "img/sym/symScorpio.png",
		starSigImg: "img/sig/scorpio.png",
		astrologicalReport: " Transient, Self-Willed, Perposeful, Unyielding. "
	},

	{
		starSig: "Sagittarius",
		dates: " Novermber 22nd - December 21st ",
		symbol: "img/sym/symSagittarius.png",
		starSigImg: "img/sig/sagittarius.png",
		astrologicalReport: " Philosophical, Motion Experimentation, Optimism. "
	},

	{
		starSig: "Capricorn",
		dates: " December 22nd - January 19th ",
		symbol: "img/sym/symCapricorn.png",
		starSigImg: "img/sig/Capricorn.png",
		astrologicalReport: " Determination, Dominance, Persevering, Practical, Wilfull. "
	}
]

function getInfo(){

	var starSig = document.getElementById("starSign").value

	for(i = 0; i < starSigObject.length; i++){
		 if(starSig == starSigObject[i].starSig){
			document.getElementById("zodiacTitleDisplay").textContent = starSigObject[i].starSig
			//document.getElementById("zodiacDescriptionDisplay").textContent = starSigObject[i].starSig
			document.getElementById("zodiacImgDisp").innerHTML = "<img src=" + starSigObject[i].starSigImg + ">"
		
			}
		}
}



