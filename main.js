document.addEventListener("DOMContentLoaded", () => {
    

    function sleep(ms) {
        return new Promise((r) => setTimeout(r, ms));
    }


    var koOpacity = 0; enOpacity = 0; inputOpacity = 0;
    var textintervalID = 0; inputintervalID = 0; 
    function textFadeOut(){
		var ko = document.getElementById("ko");
        var en = document.getElementById("en");
		koOpacity = Number(window.getComputedStyle(ko).getPropertyValue("opacity"));
        enOpacity = Number(window.getComputedStyle(en).getPropertyValue("opacity"));
		if(koOpacity > 0){
			koOpacity = koOpacity - 0.1;
			ko.style.opacity = koOpacity;
		}
		else{
			clearInterval(textintervalID);
		}
        if(enOpacity > 0){
			enOpacity = enOpacity - 0.1;
			en.style.opacity = enOpacity;
		}
		else{
			clearInterval(textintervalID);
		}
	}
    function textFadeIN(){
        var ko = document.getElementById("ko");
        var en = document.getElementById("en");
		koOpacity = Number(window.getComputedStyle(ko).getPropertyValue("opacity"));
        enOpacity = Number(window.getComputedStyle(en).getPropertyValue("opacity"));
		if(koOpacity < 1){
			koOpacity = koOpacity + 0.1;
			ko.style.opacity = koOpacity;
		}
		else{
			clearInterval(textintervalID);
		}
        if(enOpacity < 1){
			enOpacity = enOpacity + 0.1;
			en.style.opacity = enOpacity;
		}
		else{
			clearInterval(textintervalID);
		}
    }
    function inputFadeOut(){
		inputOpacity = Number(window.getComputedStyle(document.getElementById("input")).getPropertyValue("opacity"));
		if(inputOpacity > 0){
			inputOpacity = inputOpacity - 0.1;
			document.getElementById("input").style.opacity = inputOpacity;
		}
		else{
			clearInterval(inputintervalID);
		}
	}
    function inputFadeIN(){
		inputOpacity = Number(window.getComputedStyle(document.getElementById("input")).getPropertyValue("opacity"));
		if(inputOpacity < 1){
			inputOpacity = inputOpacity + 0.1;
			document.getElementById("input").style.opacity = inputOpacity;
		}
		else{
			clearInterval(inputintervalID);
		}
    }	 


    /* 답변 분석 dic, variable */
    var numberDic = {
        0: ['없', '영', 'none', 'nothing', 'don\'t', 'dont', 'not'],
        1: ['한', '하나', 'one'],
        2: ['두', '둘', 'two', '세', '셋', 'three', '네', '넷', 'four', '다섯', 'five', '여섯', 'six', '일곱', 'seven', '여덟', 'eight', '아홉', 'nine'],
        3: ['열', '십', 'ten', 'eleven', 'twelve'],
        4: ['스물', '스무', '이십', 'twenty'],
        5: ['서른', '삼십', 'thirty'],
        6: ['마흔', '사십', 'forty'],
        7: ['쉰', '오십', 'fifty'],
        8: ['예순', '육십', 'sixty'],
        9: ['일흔', '칠십', 'seventy'],
        10: ['여든', '팔십', 'eighty'],
        11: ['아흔', '구십', 'ninety'],
        12: ['많', '모든', 'many', 'countless', 'numberless', 'every', 'all']
    }
    var yesOrNoDic = {
        0: ['아니', '아뇨', '안', 'ㄴ', '없', 'no', 'never', 'nothing', 'don\'t', 'dont', 'not'],
        1: ['글쎄', '몰', '모르', '아마', 'maybe'],
        2: ['네', '예', '응', '어', '있', 'ㅇ', 'yes']
    }
    // fist classification
    let gender = -1; age = -1; degree = -1; marriage = -1; region = -1;  // Lv1
    let love = -1; hate = -1; weather = -1; important = -1; friend = -1; // Lv2
    let percent = -1; secret = -1; accuracy = -1;   // Lv3
    // second classification : score
    let genderScore = 0; ageScore = 0; degreeScore = 0; regionScore = 0; marriageScore = 0;    // Lv1
    let loveScore = 0; hateScore = 0; weatherScore = 0; importantScore = 0; friendScore = 0;    // Lv2
    let percentScore = 0; secretScore = 0;  // Lv3
    

    /* 답변 처리 함수 */    
    // Q1에 대한 input 받아 questionSeq = 1, Lv1_Q1()가 input 처리 시작
    // Lv1_Q1. What gender do you identify as?
    function Lv1_Q1(input) {
        // progress bar
        fnStep1();
        var genderDic = {
            0: ['여', '여자', '여성', 'female', 'woman', 'girl', 'she', 'her'],
            1: ['남', '남자', '남성', 'male', 'man', 'boy', 'he', 'him'],
            2: [] // contains case of 'prefer not to say'
        }
        for (let i = 0; i < Object.keys(genderDic).length; i++) {
            for (let j = 0; j < genderDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(genderDic[i][j]) !== -1) {
                    gender = i;
                }
            }
            // 'female', 'woman'은 'male', 'man'을 포함하므로 gender 값 정해진 즉시 반복문 탈출
            if (gender > -1) {
                break;
            }
        }
        if (gender == -1) {
            gender = 2;
        }
        // second classification : score
        if (gender < 2) {
            genderScore = 1;
        } else {
            genderScore = 2;
        }
        document.getElementById("ko").innerText = "당신의 나이는 무엇입니까?";  // questionSeq = 1
        document.getElementById("en").innerText = "What is your age?";
        return genderScore;
    }
    // Q2에 대한 input 받아 questionSeq = 2, Lv1_Q2()가 input 처리 시작
    // Lv1_Q2. What is your age?
    function Lv1_Q2(input) {
        // progress bar
        fnStep1();
        var ageDic = {
            0: ['한', '하나', 'one', '두', '둘', 'two', '세', '셋', 'three', '네', '넷', 'four', '다섯', 'five', '여섯', 'six', '일곱', 'seven', '여덟', 'eight', '아홉', 'nine'], // under teens, contains 0-9
            1: ['열', '십', 'ten', 'eleven', 'twelve', 'teen'], // teens, contains 10-19
            2: ['스물', '스무', '이십', '약관', 'twenty', 'twenties'], // twenties, contains 20-29
            3: ['서른', '삼십', 'thirty', 'thirties'], // thirties, contains 30-39
            4: ['마흔', '사십', '불혹', 'forty', 'forties'], // forties, contains 40-49
            5: ['쉰', '오십', 'fifty', 'fifties'], // fifties, contains 50-59
            6: ['예순', '육십', '환갑', 'sixty', 'sixties'],    // sixties, contains 60-69
            7: ['일흔', '칠십', 'seventy', 'seventies'],    // seventies, contains 70-79
            8: ['여든', '팔십', 'eighty', 'eighties'],    // eighties, contains 80-89
            9: ['아흔', '구십', 'ninety', 'nineties'],    // nineties, contains 90-99
            10: ['서른마흔다섯', '백', '천', '억'] // contains case of 'prefer not to say'
        }
        // if (typeof output) -> string
        if (isNaN(parseInt(input))) {
            // 십의 자리만 판별, 따라서 90대부터 10대까지 내림차순 확인
            for (let i = Object.keys(ageDic).length - 1; i > 0; i--) {
                for (let j = 0; j < ageDic[i].length; j++) {
                    if ((input.toLowerCase()).indexOf(ageDic[i][j]) !== -1) {
                        age = i;
                    }
                }
                // 두 자리 수일 경우, 일의 자리 수는 판별하지 않는다.
                if (age > -1) {
                    break;
                }
            }
        } 
        // if (typeof output) -> number / number + string
        else {
            if (parseInt(parseInt(input)/10) < 10) {
                age = parseInt(parseInt(input)/10);
            } else {
                age = 10;
            }
        }
        // second classification : score
        if (age < 3) {
            ageScore = 0;
        } else {
            ageScore = 1;
        }
        document.getElementById("ko").innerText = "집은 어디에 있습니까?";  // questionSeq = 2
        document.getElementById("en").innerText = "Where is your home located?";
        return ageScore;
    }
    // input 받아 questionSeq = 3, Lv1_Q3() 시작
    // Lv1_Q3. Where is your home located?
    function Lv1_Q3(input) {
        // progress bar
        fnStep1();
        var regionDic = {
            0: ['서울', 'seoul'],
            1: ['부산', 'busan', '대구', , 'daegu', '인천', 'incheon', '광주', 'gwangju', '대전', 'daejeon', '울산', 'ulsan', '세종', 'sejong', '광역'],
            2: ['경기', '강원', '충청', '전라', '경상', '황해', '평안', '함경'],
            3: ['제주', 'jeju'],
            4: [] // contains case of 'prefer not to say', 'foreign'
        }
        for (let i = 0; i < Object.keys(regionDic).length; i++) {
            for (let j = 0; j < regionDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(regionDic[i][j]) !== -1) {
                    region = i;
                }
            }
        }
        if (region == -1) {
            region = 4;
        }
        if (region == 0) {
            regionScore = 0;
        } else if (region == 1) {
            regionScore == 0.5;
        } else if (region == 2 || region == 4) {
            regionScore = 1;
        } else if (region == 3) {
            regionScore = 1.5;
        }
        document.getElementById("ko").innerText = "당신이 완료 한 가장 높은 교육 수준은 무엇입니까?";  // questionSeq = 3
        document.getElementById("en").innerText = "What is the highest degree or level of education you have completed?";
        return regionScore;
    }
    // input 받아 questionSeq = 4, Lv1_Q4() 시작
    // Lv1_Q4. What is the highest degree or level of education you have completed?
    function Lv1_Q4(input) {
        // progress bar
        fnStep1();
        var degreeDic = {
            0: ['유치원', 'kindergarten', 'preschool', 'nursery'],
            1: ['초등', '초딩', '초졸', 'elementary', 'primary'],
            2: ['중학', '중딩', '중졸', 'middle', 'secondary'],
            3: ['고등', '고딩', '고졸', '실업계', 'high'],
            4: ['대학', '대딩', '대졸', '학사', 'bachelor'],
            5: ['대학원', '석사', 'master'],
            6: ['박사', 'ph'],
            7: [] // contains case of 'prefer not to say'
        }
        for (let i = 0; i < Object.keys(degreeDic).length; i++) {
            for (let j = 0; j < degreeDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(degreeDic[i][j]) !== -1) {
                    degree = i;
                }
            }
            // '자퇴', '중퇴', 'quit', 'drop', 'left' 포함 시 한 단계 아래 학력으로 간주
            if (degree > -1) {
                if ((input.toLowerCase()).indexOf('자퇴') !== -1
                || (input.toLowerCase()).indexOf('중퇴') !== -1
                || (input.toLowerCase()).indexOf('quit') !== -1
                || (input.toLowerCase()).indexOf('drop') !== -1
                || (input.toLowerCase()).indexOf('left') !== -1) {
                    // '유치원 자퇴' 등의 표현은 제외
                    if ((degree - 1) > -1) {
                        degree -= 1;
                        break;
                    }
                }
            }
        }
        if (degree == -1) {
            degree = 7;
        }
        // second classification : score
        if (degree < 3 || degree > 5) {
            degreeScore = 1;
        } else if (degree == 3 || degree == 5) {
            degreeScore = 0.5;
        } else {
            degreeScore = 0;
        }
        document.getElementById("ko").innerText = "결혼했나요?";  // questionSeq = 4
        document.getElementById("en").innerText = "Are you married?";
        return degreeScore;
    }
    // input 받아 questionSeq = 5, Lv1_Q5() 시작
    // Lv1_Q5. Are you married?
    function Lv1_Q5(input) {
        // progress bar
        fnStep1();
        var marriageDic = {
            0: ['네', '예', '응', '어', 'ㅇ', '했', '기혼', '약혼', '있', 'yes', 'engage'],
            1: ['아니', '아뇨', '안', 'ㄴ', '미혼', '없', '혼자', '독신', 'no'],
            2: ['여러', '다녀', '었', '이혼', '사별', 'divorce', 'gone', 'death', 'die', 'bereave', 'lose'],
            3: [] // contains case of 'prefer not to say'
        }
        for (let i = 0; i < Object.keys(marriageDic).length; i++) {
            for (let j = 0; j < marriageDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(marriageDic[i][j]) !== -1) {
                    marriage = i;
                }
            }
        }
        if (marriage == -1) {
            marriage = 3;
        }
        // second classification : score
        if (marriage > 1) {
            marriageScore = 2; 
        } else {
            marriageScore = 1;
        }
        return marriageScore;
    }
    
    // input 받아 questionSeq = 6~8, Lv2_Q1() 시작
    // Lv2_Q1. 당신이 이 세상에서 사랑한다고 말할 수 있는 것은 몇 개나 되나요?
    function Lv2_Q1(input) {
        // progress bar
        fnStep2();
        // if (typeof output) -> string
        if (isNaN(parseInt(input))) {
            // 십의 자리만 판별, 따라서 90부터 10까지 내림차순 확인
            for (let i = Object.keys(numberDic).length - 1; i > 0; i--) {
                for (let j = 0; j < numberDic[i].length; j++) {
                    if ((input.toLowerCase()).indexOf(numberDic[i][j]) !== -1) {
                        love = i;
                    }
                }
                // 두 자리 수일 경우, 일의 자리 수는 판별하지 않는다.
                if (love > -1) {
                    break;
                }
            }
            if (love == -1) {
                love = 12;
            }
        } 
        // if (typeof output) -> number / number + string
        else {
            if (parseInt(parseInt(input)/10) < 10) {
                if (parseInt(parseInt(input)/10) > 0) {
                    // 두 자리 수일 경우, numberDic 구조에 따라 숫자/10 + 2 = 숫자가 속한 numberDic의 key
                    love = parseInt(parseInt(input)/10) + 2;
                } else {
                    // 한 자리 수일 경우, '1'과 '1 이상' 두 가지로 분류
                    if (parseInt(input) > 1) {
                        love = 2;
                    } else {
                        love = parseInt(input);
                    }
                }
            } else {
                love = 12;
            }
        }
        // second classification : score
        if (love < 12) {
            // 개수: 0
            if (love == 0) {
                loveScore = 2;
            // 개수: 1
            } else if (love == 1) {
                loveScore = 1.5;
            // 개수: 2~9
            } else if (love == 2) {
                loveScore = 1;
            // 개수: 10~99
            } else {
                loveScore == 0.5;
            }
        } else {
            // 개수 : 100개 이상 (contains case of 'prefer not to say', etc.)
            loveScore = 0;
        }
        return loveScore;
    }
    // input 받아 questionSeq = 6~8, Lv2_Q2() 시작
    // Lv2_Q2. 당신이 이 세상에서 증오한다고 말할 수 있는 것은 몇 개나 되나요?
    function Lv2_Q2(input) {
        // progress bar
        fnStep2();
        // if (typeof output) -> string
        if (isNaN(parseInt(input))) {
            // 십의 자리만 판별, 따라서 90부터 10까지 내림차순 확인
            for (let i = Object.keys(numberDic).length - 1; i > 0; i--) {
                for (let j = 0; j < numberDic[i].length; j++) {
                    if ((input.toLowerCase()).indexOf(numberDic[i][j]) !== -1) {
                        hate = i;
                    }
                }
                // 두 자리 수일 경우, 일의 자리 수는 판별하지 않는다.
                if (hate > -1) {
                    break;
                }
            }
            if (hate == -1) {
                love = 0;
            }
        } 
        // if (typeof output) -> number / number + string
        else {
            if (parseInt(parseInt(input)/10) < 10) {
                if (parseInt(parseInt(input)/10) > 0) {
                    // 두 자리 수일 경우, numberDic 구조에 따라 숫자/10 + 2 = 숫자가 속한 numberDic의 key
                    hate = parseInt(parseInt(input)/10) + 2;
                } else {
                    // 한 자리 수일 경우, '1'과 '1 이상' 두 가지로 분류
                    if (parseInt(input) > 1) {
                        hate = 2;
                    } else {
                        hate = parseInt(input);
                    }
                }
            } else {
                hate = 0;
            }
        }
        // second classification : score
        if (hate < 12) {
            // 개수: 0
            if (hate == 0) {
                hateScore = 0;
            // 개수: 1
            } else if (hate == 1) {
                hateScore = 0.5;
            // 개수: 2~9
            } else if (hate == 2) {
                hateScore = 1;
            // 개수: 10~99
            } else {
                hateScore == 1.5;
            }
        } else {
            // 개수 : 100개 이상 (contains case of 'prefer not to say', etc.)
            hateScore = 2;
        }
        return hateScore;
    }
    // input 받아 questionSeq = 6~8, Lv2_Q3() 시작
    // Lv2_Q3. 당신은 어떤 계절을 좋아하나요?
    function Lv2_Q3(input) {
        // progress bar
        fnStep2();
        var weatherDic = {
            0: ['다', '모든', 'all', 'every'], // contains case of 'prefer not to say'
            1: ['봄', 'spring'],
            2: ['여름', 'summer'],
            3: ['가을', 'autumn', 'fall'],
            4: ['겨울', 'winter'],
            5: ['싫', '없', '몰', '모르', '안', '글쎄', 'none', 'nothing', 'don\'t', 'dont', 'not']
        }
        for (let i = Object.keys(weatherDic).length - 1; i > 0; i--) {
            for (let j = Object.keys(weatherDic).length; j < weatherDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(weatherDic[i][j]) !== -1) {
                    weather = i;
                }
            }
        }
        if (weather == -1) {
            weather = 0;
        }
        // second classification : score
        if (weather < 2) {
            weatherScore = 0;
        } else if (weather == 2){
            weatherScore = 0.5;
        } else if (weather == 3) {
            weatherScore = 1;
        } else if (weather == 4) {
            weatherScore = 1.5;
        } else {
            weatherScore = 2;
        }
        return weatherScore;
    }
    // input 받아 questionSeq = 6~8, Lv2_Q4() 시작
    // Lv2_Q4. 인생에서 가장 중요하게 생각하는 것은 무엇인가요?
    function Lv2_Q4(input) {
        // progress bar
        fnStep2();
        var importantDic = {
            0: ['가족', '친구', '사람', 'family', 'friend', 'human'],
            1: ['사랑', 'love', '우정', 'friendship', '행복', 'happy', 'happiness', '여유', 'relax', '평온', 'peace', '열정', 'passion'],
            2: ['윤리', 'ethic', '도덕', 'moral', '양심', 'conscience', '이성', 'reason'],
            3: ['돈', '물질', '경제', 'money', 'material', 'afford'],
            4: ['없', '몰', '모르', '안', '글쎄', 'none', 'nothing', 'don\'t', 'dont', 'not']    // contains case of 'prefer not to say'
        }
        for (let i = 0; i < Object.keys(importantDic).length; i++) {
            for (let j = 0; j < importantDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(importantDic[i][j]) !== -1) {
                    important = i;
                }
            }
        }
        // second classification : score
        if (important < 1) {
            importantScore = 0;
        } else if (important == 1) {
            importantScore = 0.5;
        } else if (important == 2) {
            importantScore = 1;
        } else if (important == 3) {
            importantScore = 1.5;
        } else if (important = 4) {
            importantScore = 2;
        }
        return importantScore;
    }
    // input 받아 questionSeq = 6~8, Lv2_Q5() 시작
    // Lv2_Q5. 당신의 진정한 친구는 몇 명인가요?
    function Lv2_Q5(input) {
        // progress bar
        fnStep2();
        // if (typeof output) -> string
        if (isNaN(parseInt(input))) {
            // 십의 자리만 판별, 따라서 90부터 10까지 내림차순 확인
            for (let i = Object.keys(numberDic).length - 1; i > 0; i--) {
                for (let j = 0; j < numberDic[i].length; j++) {
                    if ((input.toLowerCase()).indexOf(numberDic[i][j]) !== -1) {
                        friend = i;
                    }
                }
                // 두 자리 수일 경우, 일의 자리 수는 판별하지 않는다.
                if (friend > -1) {
                    break;
                }
            }
            if (friend == -1) {
                friend = 0;
            }
        } 
        // if (typeof output) -> number / number + string
        else {
            // 두 자리 수일 경우
            if (parseInt(parseInt(input)/10) < 10) {
                friend = 1;
            } else {
                friend = 12;
            }
        }
        // second classification : score
        if (friend < 12) {
            // 명수: 0
            if (friend == 0) {
                friendScore = 2;
            // 명수: 1~99
            } else {
                friendScore = 1;
            }
        } else {
            // 명수 : 100명 이상 (contains case of 'prefer not to say', etc.)
            friendScore = 2;
        }
        return friendScore;
    }
    // input 받아 questionSeq = 9, Lv3_Q1() 시작
    // Lv3_Q1. 당신이 생각하는 당신은 어떤 사람인가요?
    function Lv3_Q1(input) {
        // progress bar
        fnStep3();
        // node.js 통해 python 함수 호출, 인자 발신
        lv3q1_input = input;
        return $.ajax({
            type:'POST',
            url: '/data',
            accept: "application/json",
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify({ data: input }),
        }).done(function(data){
            document.getElementById("ko").innerText = "당신의 내면은 어떤 색깔인지 설명해줄래요?";  // questionSeq = 9
            document.getElementById("en").innerText = "Could you explain what color you have on the inside?";
            return lv3q1_input;
        });
    }
    // input 받아 questionSeq = 10, Lv3_Q2() 시작
    // Lv3_Q2. 당신의 내면은 어떤 색깔인지 설명해줄래요?
    function Lv3_Q2(input) {
        // progress bar
        fnStep3();
        // node.js 통해 python 함수 호출, return 값 수신
        $.ajax({
            type:'GET',
            url: '/run?input=' + input,
        }).done(function(data){
            console.log(data);

            document.getElementById("ko").innerText = "내가 당신을 몇 퍼센트 이해할 수 있다고 생각하나요?";  // questionSeq = 9
            document.getElementById("en").innerText = "How much do you think I can understand you?";
        });
    }
    // input 받아 questionSeq = 11, Lv3_Q3() 시작
    // Lv3_Q3. 내가 당신을 몇 퍼센트 이해할 수 있다고 생각하나요?
    function Lv3_Q3(input) {
        // progress bar
        fnStep3();
        var percentDic = {
            0: ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'],
            1: ['십', 'ten', 'eleven', 'twelve', 'teen'],
            2: ['이십', 'twenty'],
            3: ['삼십', 'thirty'],
            4: ['사십', 'forty'],
            5: ['오십', 'fifty'],
            6: ['육십', 'sixty'],
            7: ['칠십', 'seventy'],
            8: ['팔십', 'eighty'],
            9: ['구십', 'ninety'],
            10: ['백', 'hundred']
        }
        // if (typeof output) -> string
        if (isNaN(parseInt(input))) {
            // 십의 자리만 판별, 따라서 90부터 10까지 내림차순 확인
            for (let i = Object.keys(percentDic).length - 1; i > 0; i--) {
                for (let j = 0; j < percentDic[i].length; j++) {
                    if ((input.toLowerCase()).indexOf(percentDic[i][j]) !== -1) {
                        percent = i;
                    }
                }
                // 두 자리 수일 경우, 일의 자리 수는 판별하지 않는다.
                if (percent > -1) {
                    break;
                }
            }
        } 
        // if (typeof output) -> number / number + string
        else {
            if (parseInt(parseInt(input)/10) <= 10) {
                percent = parseInt(parseInt(input)/10);
            } else {
                percent = 10;
            }
        }
        // second classification : score
        if (percent < 2) {
            percentScore = 2;
        } else if (percent >= 2 && percent < 4) {
            percentScore = 1.5;
        } else if (percent >= 4 && percent < 6) {
            percentScore = 1;
        } else if (percent >= 6 && percent < 8) {
            percentScore = 0.5;
        } else {
            percentScore = 0;
        }
        document.getElementById("ko").innerText = "당신이 평생 누구에게도 말하지 않은 비밀이 있습니까?";  // questionSeq = 11
        document.getElementById("en").innerText = "Is there a secret from your life that you've never told anyone?";
        return percentScore;
    }
    // input 받아 questionSeq = 12, Lv3_Q4() 시작
    // Lv3_Q4. 당신이 평생 누구에게도 말하지 않은 비밀이 있나요?
    function Lv3_Q4(input) {
        // progress bar
        fnStep3();
        for (let i = 0; i < Object.keys(yesOrNoDic).length; i++) {
            for (let j = 0; j < yesOrNoDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(yesOrNoDic[i][j]) !== -1) {
                    secret = i;
                }
            }
        }
        if (secret == -1) {
            secret = 1;
        }
        // second classification : score
        if (secret == 0) {
            secretScore = 0; 
        } else if (secret == 1) {
            secretScore = 1;
        } else {
            secretScore = 2;
        }
        return secretScore;
    }
    function Lv3_Q5(input) {
        // progress bar
        fnStep3();
        for (let i = 0; i < Object.keys(yesOrNoDic).length; i++) {
            for (let j = 0; j < yesOrNoDic[i].length; j++) {
                if ((input.toLowerCase()).indexOf(yesOrNoDic[i][j]) !== -1) {
                    accuracy = i;
                }
            }
        }
        return accuracy;
    }
            
    function output() {
        let Lv1outputKo = ""; Lv2outputKo = ""; Lv3outputKo = "";
        let Lv1outputEn = ""; Lv2outputEn = ""; Lv3outputEn = "";
        let outputSentenceKo = "";
        let outputSentenceEn = "";
        let Lv1sum = genderScore + ageScore + regionScore + degreeScore + marriageScore;
        let Lv2sum = loveScore + hateScore + weatherScore + importantScore + friendScore;
        let Lv3sum = percentScore + secretScore;
        if (Lv1sum < 4) {
            Lv1outputKo = "맑은 영혼을 가진";
            Lv1outputEn = "with a crystal-clear soul";
        } else if (Lv1sum == 4) {
            Lv1outputKo = "순수한";
            Lv1outputEn = "100% pure";
        } else if (Lv1sum == 4.5) {
            Lv1output = "보편적인";
            Lv1outputEn = "super-omnipresent";
        } else if (Lv1sum >= 5 && Lv1sum < 6) {
            Lv1outputKo = "성숙한";
            Lv1outputEn = "like the full-grown adult";
        } else if (Lv1sum == 6) {
            Lv1outputKo = "노련미가 엿보이는";
            Lv1outputEn = "like the veteran about your life experiences";
        } else {
            Lv1outputKo = "산전수전 다 겪은";
            Lv1outputEn = "an old stager";
        }
        if (Lv2sum < 1.5) {
            Lv2outputKo = "다른 사람의 관심을 즐기며 세상을 하나의 무대로 생각하는";
            Lv2outputEn = "Enjoying other people's attention and thinking of the world as your stage";
        } else if (Lv2sum >= 1.5 && Lv2sum < 3) {
            Lv2outputKo = "활기차고 낙관적인 태도로 세상을 대하는";
            Lv2outputEn = "very optimistic about dealing with the world";
        } else if (Lv2sum >= 3 && Lv2sum < 4.5) {
            Lv2outputKo = "세계와 감정적으로 깊고 의미있는 관계를 추구하는";
            Lv2outputEn = "looking for a relationship with the world that is emotionally deep and meaningful";
        } else if (Lv2sum >= 4.5 && Lv2sum < 6) {
            Lv2outputKo = "인생의 즐거움과 깊은 의미를 동시에 추구하는";
            Lv2outputEn = "who seeks both joy and deep meaning in life";
        } else if (Lv2sum >= 6 && Lv2sum < 7.5) {
            Lv2outputKo = "사회를 위해 자신의 몫보다 많은 기여를 하는";
            Lv2outputEn = "who contributes more than one's fair share to society";
        } else if (Lv2sum >= 7.5 && Lv2sum < 9) {
            Lv2outputKo = "행복이나 희열이 덧없는 일시적인 것에 불과하다고 믿는";
            Lv2outputEn = "who believes that happiness is only temporary is called a hedonist";
        } else {
            Lv2outputKo = "나를 둘러싼 세계를 도리어 고독하게 만드는";
            Lv2outputEn = "who makes the world around me lonely is like a black cloud";
        }
        if (Lv3sum == 0) {
            Lv3outputKo = "페퍼민트의 톡 쏘는 향처럼 솔직하고 거침없는";
            Lv3outputEn = "a straightforward and outspoken person just like the scent of peppermint strong and refreshing.";
        } else if (Lv3sum < 2) {
            Lv3outputKo = "나 자신에게 그 누구보다 솔직한";
            Lv3outputEn = "honest with myself than anyone else.";
        } else if (Lv3sum >= 2 && Lv3sum < 3) {
            Lv3outputKo = "눈빛에서 진실함이 묻어나오는";
            Lv3outputEn = "with eyes telling the truth.";
        } else if (Lv3sum >= 3 && Lv3sum < 4) {
            Lv3outputKo = "내면이 흑과 백으로 섞여서 오묘한 빛을 내는";
            Lv3outputEn = "creating a mysterious glow with a mixture of black and white.";
        } else if (Lv3sum >= 4 && Lv3sum < 5) {
            Lv3outputKo = "소중하게 간직한 내면의 비밀이 있는";
            Lv3outputEn = "having a secret that you cherish.";
        } else if (Lv3sum >= 5 && Lv3sum < 6) {
            Lv3outputKo = "비밀스러운 기억으로 속이 꽤나 시끄러운";
            Lv3outputEn = "with secret memories may make noise due to them.";
        } else {
            Lv3outputKo = "무섭도록 정교한 고독을 품은";
            Lv3outputEn = "chillingly lonely.";
        }
        outputSentenceKo = "당신은 " + Lv1outputKo + ", " + Lv2outputKo + ", \n그리고 " + Lv3outputKo + " 사람이네요.";
        outputSentenceEn = "You are a person who is " + Lv1outputEn + ",\n" + Lv2outputEn + ", \n" + Lv3outputEn;
        // previous variable data initialization: 변수에 저장된 이전 값 초기화
        gender = -1; age = -1; region = -1; degree = -1; marriage = -1; love = -1; hate = -1; friend = -1; weather = -1; important = -1;
        genderScore = -1; ageScore = -1; regionScore = -1; degreeScore = -1; marriageScore = -1; loveScore = 0; hateScore = 0; friendScore = 0; weatherScore = 0; importantScore = 0; percentScore = -1; secretScore = -1;
        return [outputSentenceKo, outputSentenceEn];
    }


    /* audio */
    var noise = new SimplexNoise();
    //var audio = new Audio("test.mp3");
    //audio.play();
    //audio.autoplay = true;
    //audio.loop = true;
    //audio.volume = 0.2;


    /* three.js */
    /*
    function startViz() {
        
        //audio anayser setup
        var context = new AudioContext();
        var src = context.createMediaElementSource(audio);
        var analyser = context.createAnalyser();
        src.connect(analyser);
        analyser.connect(context.destination);
        analyser.fftSize = 512;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
    
        //webgl
        var scene = new THREE.Scene();
        var group = new THREE.Group();
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 100;
        scene.add(camera);
    

        var renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setClearColor(0x000000);
        renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById('container').appendChild(renderer.domElement);
    
        // IcosahedronGeometry(크기: Float, 면수: Integer)
        var geometry = new THREE.IcosahedronGeometry(15, 1);
        var wireframe = new THREE.EdgesGeometry(geometry);
        //var icosahedronGeometry = new THREE.IcosahedronGeometry(20, 1);
        
        var lambertMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            wireframe: true
        });
        
    
        var material = new THREE.ShaderMaterial({
            uniforms: {
                color1: {
                    value: new THREE.Color("#fff1eb")
                },
                color2: {
                    value: new THREE.Color("#3d3d3d")
                }
            },
            vertexShader: `
              varying vec2 vUv;
          
              void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
              }
            `,
            fragmentShader: `
              uniform vec3 color1;
              uniform vec3 color2;
              
              varying vec2 vUv;
              
              void main() {
                gl_FragColor = vec4(mix(color1, color2, vUv.y), 1.0);
              }
            `,
            wireframe: true
        });
    
        var ambientLight = new THREE.AmbientLight(0xaaaaaa);
        scene.add(ambientLight);
    
        //var ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
        //ball.position.set(0, 0, 0);

        //original
        var ball = new THREE.Mesh(geometry, material);
        ball.position.set(0, 10, 0);

        group.add(ball);
        scene.add(group);
    
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
    
        function render() {
            analyser.getByteFrequencyData(dataArray);
    
            var lowerHalfArray = dataArray.slice(0, (dataArray.length / 2) - 1);
            var upperHalfArray = dataArray.slice((dataArray.length / 2) - 1, dataArray.length - 1);
    
            var overallAvg = avg(dataArray);
            var lowerMax = max(lowerHalfArray);
            var lowerAvg = avg(lowerHalfArray);
            var upperMax = max(upperHalfArray);
            var upperAvg = avg(upperHalfArray);
    
            var lowerMaxFr = lowerMax / lowerHalfArray.length;
            var lowerAvgFr = lowerAvg / lowerHalfArray.length;
            var upperMaxFr = upperMax / upperHalfArray.length;
            var upperAvgFr = upperAvg / upperHalfArray.length;
    
            ball.rotation.x += 0.001;
            ball.rotation.y += 0.005;
            ball.rotation.z += 0.002;
    
            WarpBall(ball, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
    
            requestAnimationFrame(render);
            renderer.render(scene, camera);
        };
    
        function WarpBall(mesh, bassFr, treFr) {
            mesh.geometry.vertices.forEach(function (vertex, i) {
                var offset = mesh.geometry.parameters.radius;
                var amp = 5;
                var time = window.performance.now();
                vertex.normalize();
                var rf = 0.00001;
                var distance = (offset + bassFr) + noise.noise3D(vertex.x + time*rf*6, vertex.y + time*rf*7, vertex.z + time*rf*8) * amp * treFr;
                vertex.multiplyScalar(distance);
            });
            mesh.geometry.verticesNeedUpdate = true;
            mesh.geometry.normalsNeedUpdate = true;
            mesh.geometry.computeVertexNormals();
            mesh.geometry.computeFaceNormals();
        }
        render();
        */
        
        /*
        const scene = new THREE.Scene(),
            width = window.innerWidth,
            height = window.innerHeight,
            camera = new THREE.PerspectiveCamera(75, width / height, 1, 1000),
            renderer = new THREE.WebGLRenderer(),
            startTime = new Date().getTime(),
            timeOffset = 15

        let currentTime = 0

        renderer.setSize(window.innerWidth, window.innerHeight)
        document.getElementById('container').appendChild(renderer.domElement)

        let CameraHolder = new THREE.Object3D()
        CameraHolder.add(camera)
        CameraHolder.rotation.x = Math.PI * .15;
        scene.add(CameraHolder)

        const composer = new THREE.EffectComposer(renderer)

        const renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);

        var outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
        composer.addPass(outlinePass);

        let bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(width, height), 1.5, .4, .85);
        renderer.toneMappingExposure = 1;
        bloomPass.threshold = 0;
        bloomPass.strength = 1.5;
        bloomPass.radius = 1.5;
        composer.addPass(bloomPass);

        let filmPass = new THREE.FilmPass(0.34, 0.025, 256, false);
        composer.addPass(filmPass);

        outlinePass.edgeStrength = 3
        outlinePass.edgeThickness = 1
        outlinePass.edgeGlow = 0
        outlinePass.visibleEdgeColor.set('#ffffff')
        outlinePass.hiddenEdgeColor.set('#ffffff')
        outlinePass.BlurDirectionX = new THREE.Vector2(0.0, 0.0)
        outlinePass.BlurDirectionY = new THREE.Vector2(0.0, 0.0)

        let uniforms = {
            camera: {
                value: camera.position
            },
            time: {
                value: 0
            }
        }

        //var geometry = new THREE.PlaneGeometry(Math.round(width * 0.005), Math.round(height * 0.005), 600, 600);
        var geometry = new THREE.SphereGeometry(1, 100, 100);
        // var geometry = new THREE.TorusGeometry(2, 1, 32, 200);
        let material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            fragmentShader: shaders.cloth.fragment,
            vertexShader: shaders.cloth.vertex
        })
        var plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
        camera.position.z = 28

        function animate() {
            var now = new Date().getTime();
            currentTime = (now - startTime) / 1000;
            let t = currentTime + timeOffset;

            CameraHolder.updateMatrixWorld();
            var vector = camera.position.clone();
            vector.applyMatrix4(camera.matrixWorld);

            uniforms.time.value = t;
            uniforms.camera.value = vector;

            //camera.fov = 55 + Math.cos(t) * 50;
            camera.position.z = 3 + Math.cos(t) * -1;
            camera.updateProjectionMatrix();

            //CameraHolder.rotation.z = t * 0.1
            //CameraHolder.rotation.x =  Math.cos(t * 0.15) * (Math.PI * .25)

            requestAnimationFrame(animate)
            //renderer.render(scene, camera)
            composer.render()
        }
        animate()
    };
    startViz();
    //helper functions
    function fractionate(val, minVal, maxVal) {
        return (val - minVal) / (maxVal - minVal);
    }
    
    function modulate(val, minVal, maxVal, outMin, outMax) {
        var fr = fractionate(val, minVal, maxVal);
        var delta = outMax - outMin;
        return outMin + (fr * delta);
    }
    
    function avg(arr) {
        var total = arr.reduce(function (sum, b) { return sum + b; });
        return (total / arr.length);
    }
    
    function max(arr) {
        return arr.reduce(function (a, b) { return Math.max(a, b); })
    */

    let renderer,
    scene,
    camera,
    //sphereBg,
    nucleus,
    //controls,
    container = document.getElementById("container"),
    timeout_Debounce,
    //cameraSpeed = 0,
    blobScale = 3;
    function init() {
        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.01, 1000)
        camera.position.set(0,0,230);
    
        const directionalLight = new THREE.DirectionalLight("#fff", 2);
        directionalLight.position.set(0, 50, -20);
        scene.add(directionalLight);
    
        let ambientLight = new THREE.AmbientLight(0xaaaaaa, 1);
        ambientLight.position.set(0, 20, 20);
        scene.add(ambientLight);
    
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        renderer.setClearColor(0x000000);

        //const colours = chroma.scale(['#A947F2', '#FF29BD', '#FF5286', '#FF905C', '#FFC84F', '#F9F871']);

        let icosahedronGeometry = new THREE.IcosahedronGeometry(30, 8);
        let lambertMaterial = new THREE.MeshPhongMaterial({wireframe: true, vertexColors: true});
        nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
        nucleus.position.set(0, 10, 0)
        scene.add(nucleus);

        function randomPointSphere (radius) {
            let theta = 2 * Math.PI * Math.random();
            let phi = Math.acos(2 * Math.random() - 1);
            let dx = 0 + (radius * Math.sin(phi) * Math.cos(theta));
            let dy = 0 + (radius * Math.sin(phi) * Math.sin(theta));
            let dz = 0 + (radius * Math.cos(phi));
            return new THREE.Vector3(dx, dy, dz);
        }
    }
    function animate() {
        nucleus.geometry.vertices.forEach(function (v) {
            let time = Date.now();
            v.normalize();
            let distance = nucleus.geometry.parameters.radius + noise.noise3D(
                v.x + time * 0.0005,
                v.y + time * 0.0003,
                v.z + time * 0.0008
            ) * blobScale;
            v.multiplyScalar(distance);
        })

        nucleus.geometry.verticesNeedUpdate = true;
        nucleus.geometry.normalsNeedUpdate = true;
        nucleus.geometry.computeVertexNormals();
        nucleus.geometry.computeFaceNormals();
        nucleus.rotation.y += 0.002;

        //stars.geometry.verticesNeedUpdate = true;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    init();
    animate();
    window.addEventListener("resize", () => {
        clearTimeout(timeout_Debounce);
        timeout_Debounce = setTimeout(onWindowResize, 80);
    });
    function onWindowResize() {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    }


    /* Lv1-3 질문 순서대로 출력 */
    let questionSeq = 0;
    document.getElementById("ko").innerText = "당신은 자신을 어떤 성별로 식별합니까?";
    document.getElementById("en").innerText = "What gender do you identify as?";
    var randomNums = [0, 0, 0];
    for (let i = 0; i < randomNums.length; i++) {
        randomNums[i] = Math.floor(Math.random()*5);
        for (let j = 0; j < i; j++) {
            if (randomNums[i] == randomNums[j]) {
                i--;
            }
        }
    }
    const inputField = document.getElementById("input");
    inputField.addEventListener("keydown", function(e) {
        if (e.keyCode == 13) {
            questionSeq++;
            let input = inputField.value;
            inputField.value = "";

            // input 먼저 받은 후 처리 및 다음 질문 출력
            // Lv1 질문은 순서대로 출력
            if (questionSeq == 1) {Lv1_Q1(input);}
            if (questionSeq == 2) {Lv1_Q2(input);}
            if (questionSeq == 3) {Lv1_Q3(input);}
            if (questionSeq == 4) {Lv1_Q4(input);}
            if (questionSeq >= 5) {
                var Lv2_Q = {
                    0: ["당신이 이 세상에서 사랑한다고 말할 수 있는 것은 몇 개나 됩니까?", "How many things can you say you love in this world?"],
                    1: ["당신이 이 세상에서 증오한다고 말할 수 있는 것은 몇 개나 됩니까?", "How many things can you say you hate in this world?"],
                    2: ["당신은 어떤 계절을 좋아합니까?", "What is your favorite season?"],
                    3: ["인생에서 가장 중요하게 생각하는 것은 무엇입니까?", "What is the most important value in your life?"],
                    4: ["당신의 진정한 친구는 몇 명입니까?", "How many people can you rely on?"]
                }
                if (questionSeq == 5) {
                    Lv1_Q5(input);
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 100); inputintervalID = setInterval(inputFadeOut, 100);});
                    sleep(2000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "당신에 대한 기본적인 것은 알겠어요. 그래도 당신을 조금 더 알려주세요.")
                        .then(() => document.getElementById("en").innerText = "Tell me more about you.")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                            .then(() => sleep(2000)
                                .then(() => document.getElementById("answer").style.display = 'block')
                                .then(() => document.getElementById("ko").innerText = Lv2_Q[randomNums[0]][0])
                                .then(() => document.getElementById("en").innerText = Lv2_Q[randomNums[0]][1])
                                .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 200); inputintervalID = setInterval(inputFadeIN, 200)}))
                                .then(() => sleep(3000)
                                )
                            )
                        )
                }
                // Lv2 질문은 랜덤 3개 출력
                if (questionSeq == 6) {
                    if (randomNums[0] == 0) {Lv2_Q1(input);}
                    if (randomNums[0] == 1) {Lv2_Q2(input);}
                    if (randomNums[0] == 2) {Lv2_Q3(input);}
                    if (randomNums[0] == 3) {Lv2_Q4(input);}
                    if (randomNums[0] == 4) {Lv2_Q5(input);}
                    //document.getElementById("answer").style.display ='block';
                    document.getElementById("ko").innerText = Lv2_Q[randomNums[1]][0];
                    document.getElementById("en").innerText = Lv2_Q[randomNums[1]][1];
                    //intervalID = setInterval(textFadeIN, 200);
                }
                if (questionSeq == 7) {
                    if (randomNums[1] == 0) {Lv2_Q1(input);}
                    if (randomNums[1] == 1) {Lv2_Q2(input);}
                    if (randomNums[1] == 2) {Lv2_Q3(input);}
                    if (randomNums[1] == 3) {Lv2_Q4(input);}
                    if (randomNums[1] == 4) {Lv2_Q5(input);}
                    document.getElementById("ko").innerText = Lv2_Q[randomNums[2]][0];
                    document.getElementById("en").innerText = Lv2_Q[randomNums[2]][1];
                }
                if (questionSeq == 8) {
                    if (randomNums[2] == 0) {Lv2_Q1(input);}
                    if (randomNums[2] == 1) {Lv2_Q2(input);}
                    if (randomNums[2] == 2) {Lv2_Q3(input);}
                    if (randomNums[2] == 3) {Lv2_Q4(input);}
                    if (randomNums[2] == 4) {Lv2_Q5(input);}
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 100); inputintervalID = setInterval(inputFadeOut, 100);});
                    sleep(2000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "알겠습니다. 마지막으로 조금만 더 물어보겠습니다.")
                        .then(() => document.getElementById("en").innerText = "level 3")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                            .then(() => sleep(2000)
                                .then(() => document.getElementById("answer").style.display = 'block')
                                .then(() => document.getElementById("ko").innerText = "당신이 생각하는 당신은 어떤 사람입니까?")
                                .then(() => document.getElementById("en").innerText = "What kind of person do you think you are?")
                                .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100); inputintervalID = setInterval(inputFadeIN, 100)}))
                                .then(() => sleep(3000)
                                )
                            )
                        )
                }
                // Lv3 질문은 순서대로 출력
                if (questionSeq == 9) {Lv3_Q1(input);}
                if (questionSeq == 10) {Lv3_Q2(input);}
                if (questionSeq == 11) {Lv3_Q3(input);}
                if (questionSeq == 12) {
                    Lv3_Q4(input);
                    function toTransition(){
                        document.getElementById("level").style.display ='none';
                        document.getElementById("container").style.display ='none';
                        document.getElementById("output").style.display ='none';
                        document.getElementById("continue").style.display ='none';
                        document.body.style.backgroundColor = '#0000CD'; 

                        const content = "P̵̻̦̻͆r̴̜̗̈́̊͠e̸͎̦̪͐̀͒s̴̻̍̀͗s̶̨̡̉̈́ ̷̢͗̄̒Ę̶̄̓Ṋ̶͚̙̎̚͝T̴̫͊͋E̶͙̣̔̋̕ͅR̴͍̓̒̃͜ ̸͎̥̲̀͐̋i̶̡̗̓̾f̸̥̠̯̃͂̚ ̸̠̈́͗͘ÿ̸͇́͜ö̴̼̣́ͅṳ̷̪̽ ̸͖͇̭̂ẅ̸͓̗͉́a̴̟̰̮͐͆̉ṋ̶̠̗̍t̸̮̫̦̆̆̽ ̴͚̭͓͐͆t̷̻̳͐o̸̠̙̚ ̶̢͎̓̎͗t̶̩̱͛͑a̷͕̋̕ḷ̷̈͆͝ͅk̵̯͇͂̽͝ ̶̭̚ẘ̶͔̇̌ȋ̶̗͂͘t̴͕̭͈͘͘ḣ̴̝̥̏̕ ̷̪̟͊͝͝m̸͓̥̾̒e̸͕̩̊̎̈.̴̩́";  
                        const code = document.getElementById("transition");
                        let i = 0;
                        function typing(){
                            if (i < content.length) {
                                let codeText = content.charAt(i);
                                code.innerHTML += codeText; 
                                i++;
                            }
                        }
                        setInterval(typing, 1);
                    }
                    function fromTransition() {
                        document.getElementById("transition").style.display ='none';
                        document.getElementById('transitionVideo').style.display = 'none';
                        document.getElementById("level").style.display ='block';
                        document.getElementById("container").style.display ='block';
                        document.getElementById("output").style.display ='block';
                        document.getElementById("continue").style.display ='block';
                        document.body.style.backgroundColor = '#000000';
                    }
                    function transitionVideo() {
                        document.getElementById("transition").style.display ='none';
                        document.getElementById("level").style.display ='none';
                        document.getElementById("container").style.display ='none';
                        document.getElementById("output").style.display ='none';
                        document.getElementById("continue").style.display ='none';
                        document.getElementById('transitionVideo').style.display = 'block';
                        document.getElementById('transitionVideo').style.height = String(window.innerHeight)+"px";
                        document.getElementById('transitionVideo').play();
                    }
                    let [outputKo, outputEn] = output();
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 200); inputintervalID = setInterval(inputFadeOut, 200);});
                    sleep(1000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "좋아요! 당신의 말하지 않은 내면을 들여다볼게요.")
                        .then(() => document.getElementById("en").innerText = "Briiliant! Let me see take a look at your unsaid inner world.")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => toTransition())
                            .then(() => sleep(5000)
                                .then(() => transitionVideo())
                                .then(() => sleep(5000)
                                    .then(() => fromTransition())
                                    .then(() => document.getElementById("ko").innerText = "오늘 우리가 나눈 이야기들로 나는 당신을 완전히 이해했어요.")
                                    .then(() => document.getElementById("en").innerText = "Through the stories we shared today, I completely understand you.")
                                    .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                                    .then(() => sleep(3000)
                                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                                        .then(() => sleep(2000)
                                            .then(() => document.getElementById("ko").style.fontSize = "18px")
                                            .then(() => document.getElementById("en").style.fontSize = "14px")
                                            .then(() => document.getElementById("ko").innerText = outputKo)
                                            .then(() => document.getElementById("en").innerText = outputEn)
                                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                                            .then(() => sleep(15000)
                                                .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                                                .then(() => sleep(2000)
                                                    .then(() => document.getElementById("answer").style.display ='block')
                                                    .then(() => document.getElementById("ko").style.fontSize = "22px")
                                                    .then(() => document.getElementById("en").style.fontSize = "16px")
                                                    .then(() => document.getElementById("ko").innerText = "당신의 자아가 내가 말하는 것과 일치하나요?")
                                                    .then(() => document.getElementById("en").innerText = "Do you agree with what I am saying?")
                                                    .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100); inputintervalID = setInterval(inputFadeIN, 100)}))
                                                    .then(() => sleep(3000)
                                                    )
                                                )
                                            )
                                        )
                                    )
                                )
                            )
                        )    
                }
                if (questionSeq == 13) {
                    Lv3_Q5(input);
                    accuracy = -1;
                    // ENTER 누르면 'start' link 강제 클릭, 'index.gtml'로 이동
                    window.location.href="start.html";
                }
            }
        }       
    });
});

/* progress bar */
// progress start
const circle1 = document.getElementById("step-1");
const circle2 = document.getElementById("step-2");
const circle3 = document.getElementById("step-3");
let step1procress = new CircleProgress(circle1);
const step2procress = new CircleProgress(circle2);
const step3procress = new CircleProgress(circle3);
step1procress.max = 100;
step1procress.value = 0;
step2procress.max = 100;
step2procress.value = 0;
step3procress.max = 100;
step3procress.value = 0;
// progress end
function fnStep1() {
  step1procress.value += 20;
}
function fnStep2() {
  step2procress.value += 34;
}
function fnStep3() {
  step3procress.value += 25;
}