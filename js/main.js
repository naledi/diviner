
var starSigObject = [
	{
		starSig: "Aquarius",
		dates : " January 20th - February 18th ",
		symbol: " img/sym/symAquarius.png ",
		starSigImg: "img/sig/aquarius.png",
		characteristics:" Knowlage, Humanitarian, Seriouse, Insightfull, Duplicitous. ",
		report: "You will fall in love"
	},

	{
		starSig: "Pisces",
		dates : " March 21st - February 19th ",
		symbol: "img/sym/symPisces.png",
		starSigImg: "img/sig/pisces.png",
		characteristics: " Fluctuation, Depth, Imagination, Reactive, Indecisive. ",
		report: ""
	},

	{
		starSig: "Aries",
		dates: " March 21st - April 19th ",
		symbol: "img/sym/symAries.png",
		starSigImg: "img/sig/aries.png",
		characteristics: " Active, Demanding, Determined, Effective, Ambitious. ", 
		report:""
	},

	{
		starSig: "Taurus",
		dates: " April 20th - May 20th ",
		symbol: "img/sym/symTaurus.png",
		starSigImg: "img/sig/taurus.png",
		characteristics: " Security, Subtle Strength, Appreciation, Instruction, Patinece. ",
		report: ""
	},

	{
		starSig: "Gemini",
		dates: " May 21st - Jun 20th ",
		symbol: "img/sym/symGemini.png",
		starSigImg: "img/sig/gemini.png",
		characteristics: " Communication, Indecision, Inquisitive, Intelligent, Changeable. ",
		report: ""
	},

	{
		starSig: "Cancer",
		dates: " June 21st - July 22nd ",
		symbol: "img/sym/symCancer.png",
		starSigImg: "img/sig/cancer.png",
		characteristics: " Emotion, Diplomatic, Intensity, Impulsive, Selective. ",
		report: ""
	},

	{
		starSig: "Leo",
		dates: " July 23rd - August 22nd ",
		symbol: "img/sym/symLeo.png",
		starSigImg: "img/sig/leo.png",
		characteristics: " Rulling, Warmth, Generoity, Faithfyl, Initiative. ",
		report: ""
	},

	{
		starSig: "Virgo",
		dates: " August 23rd - September 22nd ",
		symbol: "img/sym/symVirgo.png",
		starSigImg: "img/sig/virgo.png",
		characteristics: " Analyzing, Practical, Reflective, Obervation, Thoughtful. ",
		report: ""
	},

	{
		starSig: "Libra",
		dates: " September 23rd - October 22nd ",
		symbol: "img/sym/symLibra.png",
		starSigImg: "img/sig/libra.png",
		characteristics: " Balance, Justice, Truth, Beauty, Perfection. ",
		report: ""
	},

	{
		starSig: "Scorpio",
		dates: " October 23 - Novermber 22nd ",
		symbol: "img/sym/symScorpio.png",
		starSigImg: "img/sig/scorpio.png",
		characteristics: " Transient, Self-Willed, Perposeful, Unyielding. ",
		report: ""
	},

	{
		starSig: "Sagittarius",
		dates: " Novermber 22nd - December 21st ",
		symbol: "img/sym/symSagittarius.png",
		starSigImg: "img/sig/sagittarius.png",
		characteristics: " Philosophical, Motion Experimentation, Optimism. ",
		report: ""
	},

	{
		starSig: "Capricorn",
		dates: " December 22nd - January 19th ",
		symbol: "img/sym/symCapricorn.png",
		starSigImg: "img/sig/Capricorn.png",
		characteristics: " Determination, Dominance, Persevering, Practical, Wilfull. ",
		report: ""
	}
]

function getInfo(){

	var starSig = document.getElementById("starSign").value

	for(i = 0; i < starSigObject.length; i++){
		 if(starSig == starSigObject[i].starSig){
			document.getElementById("titleLeftModal").textContent = starSigObject[i].starSig + " Characteristics"
			document.getElementById("zodiacCharDisplay").textContent = starSigObject[i].characteristics
			document.getElementById("titleRightModal").textContent = starSigObject[i].starSig + " Asrtological Report"
			document.getElementById("zodiacRepDisplay").textContent = starSigObject[i].report
			document.getElementById("zodiacImgDisp").innerHTML = "<img src=" + starSigObject[i].starSigImg + ">"
		
			}
			document.getElementById("leftModal").style.display = 'inline-block';
			document.getElementById("rightModal").style.display = 'inline-block';
		}
}



