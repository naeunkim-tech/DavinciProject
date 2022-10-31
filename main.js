document.body.style.backgroundColor = "black";

document.addEventListener("DOMContentLoaded", () => {

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

    /* circle */
    const fragment = /* glsl */ `#version 300 es
    precision highp float;

    #define M_PI 3.1415926535897932384626433832795

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float center_x;
    uniform float center_y;
    uniform float radius;
    uniform float orbit_radius;
    uniform float breath_tempo;
    uniform float orbit_tempo;
    uniform float displacement;
    uniform vec3 color_a;
    uniform vec3 color_b;
    uniform float inner_blur_a;
    uniform float inner_blur_b;
    uniform float outer_blur_a;
    uniform float outer_blur_b;
    out vec4 outColor;

    vec4 blurry_circle(float center_x, float center_y, float radius, float variable_radius, float breath_tempo, float inner_blur, float outer_blur, vec3 base_color);
    vec4 blend(vec4 a, vec4 b);
    vec4 the_circle(float cx, float cy, float r, float displacement, float or, float breath_tempo, float orbit_tempo, vec3 color_a, vec3 color_b, float inner_blur_a, float inner_blur_b, float outer_blur_a, float outer_blur_b);

    void main(){
        outColor = the_circle(center_x, center_y, radius, displacement, orbit_radius, breath_tempo, orbit_tempo, color_a, color_b, inner_blur_a, inner_blur_b, outer_blur_a, outer_blur_b);
    }

    vec4 the_circle(float cx, float cy, float r, float displacement, float or, float breath_tempo, float orbit_tempo, vec3 color_a, vec3 color_b, float inner_blur_a, float inner_blur_b, float outer_blur_a, float outer_blur_b){
        float orbit_x = or * cos(u_time*orbit_tempo);
        float orbit_y = or * sin(u_time*orbit_tempo);
        vec4 pixel_color = blurry_circle(cx+orbit_x, cy+orbit_y, r+orbit_radius, r*0.2, breath_tempo, inner_blur_a*0.3, outer_blur_a*1.1, color_a);
        pixel_color = blend(blurry_circle(cx, cy, r, r*0.2, breath_tempo, inner_blur_a, outer_blur_a, color_a), pixel_color);
        pixel_color = blend(blurry_circle(cx, cy, r+displacement, r*0.2, breath_tempo, inner_blur_b, outer_blur_b, color_b), pixel_color);
        
        return pixel_color;
    }
    vec4 blend(vec4 a, vec4 b){
        return a + b * (1.0 - a.a);
    }
    vec4 blurry_circle(float center_x, float center_y, float radius, float variable_radius, float breath_tempo, float inner_blur, float outer_blur, vec3 base_color){
        float d = min(u_resolution.x, u_resolution.y);
        vec2 st = gl_FragCoord.xy/vec2(d);
        float cx = center_x/d;
        float cy = center_y/d;
        float r = radius/d;
        float vr = variable_radius/d;
        float ib = inner_blur/d;
        float ob = outer_blur/d;
        float pct = 0.0;
        float inner_ratio = M_PI/ib;
        float outer_ratio = M_PI/ob;
        
        float dist = distance(st,vec2(cx, cy));
        
        r += sin(u_time*breath_tempo)*vr/2.;
        float th = (dist-r);
        if(dist<=r){
            th *= inner_ratio;
        }
        else{
            th *= outer_ratio;
        }
        if (th<-M_PI || th>M_PI){
        pct = 0.;
        }else{
        pct = (cos(th)/2.0)+0.5;
        }
        
        vec3 color = base_color*pct;
        
        return vec4(color, pct);
    }
    `;
    const vertex = /* glsl */ `#version 300 es
    in vec4 a_position;

    void main() {
        gl_Position = a_position;
    }
    `;
    class TheCircle {
        constructor(canvas) {
            this._initialize(canvas);
        }
    
        _initialize(canvas) {
            this.canvas = canvas
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.backgroundColor = "black";
            canvas.display = 'block';
            canvas.top = 0;
            canvas.left = 0;
            this.gl = this.canvas.getContext("webgl2");
    
            this._setupShader();
            this._setupEvents();
            this._setupModel();
    
            this.resize();
            this.setCenter(0.5, 0.7);
            this.setRadius(33);
            this.setDisplacement(-5);
            this.setBreathTempo(1);
            this.setOrbitRadius(20);
            this.setOrbitTempo(4);
            this.setColorA([0.3, 0.0, 0.7]);
            this.setBlurA(66, 99);
            this.setColorB([0.9, 0.9, 0.9]);
            this.setBlurB(27.5, 82.5);
            this.setBackgroundColor([0.15, 0.35, 0.42], [0.1, 0.22, 0.29], [0.22, 0.34, 0.54]);
            this.audio_bound = false;
            this.audio = null;
        }
    
        _setupShader() {
            const gl = this.gl;
            const program = webglUtils.createProgramFromSources(gl, [vertex, fragment]);
    
            gl.useProgram(program);
    
            this.program = program;
        }
    
        _setupEvents() {
            window.onresize = this.resize.bind(this);
        }
    
        resize() {
            const gl = this.gl;
    
            gl.canvas.width = window.innerWidth;
            gl.canvas.height = window.innerHeight;
            gl.uniform1f(this.centerXLocation, this.centerX*gl.canvas.width);
            gl.uniform1f(this.centerYLocation, this.centerY*gl.canvas.height);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        }
    
        _setupModel() {
            const gl = this.gl;
            const program = this.program;
    
            this.positionAttributeLocation = gl.getAttribLocation(program, "a_position");
            this.resolutionLocation = gl.getUniformLocation(program, "u_resolution");
            this.timeLocation = gl.getUniformLocation(program, "u_time");
            this.centerXLocation = gl.getUniformLocation(program, "center_x");
            this.centerYLocation = gl.getUniformLocation(program, "center_y");
            this.radiusLocation = gl.getUniformLocation(program, "radius");
            this.orbitRadiusLocation = gl.getUniformLocation(program, "orbit_radius");
            this.breathTempoLocation = gl.getUniformLocation(program, "breath_tempo");
            this.orbitTempoLocation = gl.getUniformLocation(program, "orbit_tempo");
            this.colorALocation = gl.getUniformLocation(program, "color_a");
            this.colorBLocation = gl.getUniformLocation(program, "color_b");
            this.innerBlurALocation = gl.getUniformLocation(program, "inner_blur_a");
            this.innerBlurBLocation = gl.getUniformLocation(program, "inner_blur_b");
            this.outerBlurALocation = gl.getUniformLocation(program, "outer_blur_a");
            this.outerBlurBLocation = gl.getUniformLocation(program, "outer_blur_b");
            this.displacementLocation = gl.getUniformLocation(program, "displacement");
    
            const positionBuffer = gl.createBuffer();
    
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
                -1, -1, 1, -1, -1,  1,
                -1,  1, 1, -1,  1,  1,
            ]), gl.STATIC_DRAW);
    
            gl.enableVertexAttribArray(this.positionAttributeLocation);
    
            gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        }
    
        bindAudio(audio) {
            this.audio = audio;
            this.audio_bound = true;
            this.audio_context = new (window.AudioContext || window.webkitAudioContext)();
            this.audio_source = this.audio_context.createMediaElementSource(audio);
            this.analyser = this.audio_context.createAnalyser();
            this.audio_source.connect(this.analyser);
            this.analyser.connect(this.audio_context.destination);
            this.analyser.fftSize = 128;
            this.bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(this.bufferLength);
            this.smooth_variance = 0.0;
        }
    
        setRadius(radius) {
            this.radius = radius/1.0;
            const gl = this.gl;
            gl.uniform1f(this.radiusLocation, this.radius);
        }
    
        setDisplacement(displacement) {
            this.displacement = displacement/1.0;
            const gl = this.gl;
            gl.uniform1f(this.displacementLocation, this.displacement);
        }
    
        setOrbitRadius(orbitRadius) {
            this.orbitRadius = orbitRadius/1.0;
            const gl = this.gl;
            gl.uniform1f(this.orbitRadiusLocation, this.orbitRadius);
        }
    
        setCenter(x, y) {
            this.centerX = x;
            this.centerY = y;
            const gl = this.gl;
            gl.uniform1f(this.centerXLocation, x*gl.canvas.width);
            gl.uniform1f(this.centerYLocation, y*gl.canvas.height);
        }
    
        setBreathTempo(tempo) {
            this.breath_tempo = tempo;
            const gl = this.gl;
            gl.uniform1f(this.breathTempoLocation, tempo);
        }
    
        setOrbitTempo(tempo) {
            this.orbit_tempo = tempo;
            const gl = this.gl;
            gl.uniform1f(this.orbitTempoLocation, tempo);
        }
    
        setColorA(color) {
            this.color_a = color;
            const gl = this.gl;
            gl.uniform3f(this.colorALocation, color[0], color[1], color[2]);
        }
    
        setColorB(color) {
            this.color_b = color;
            const gl = this.gl;
            gl.uniform3f(this.colorBLocation, color[0], color[1], color[2]);
        }
    
        setBlurA(inner, outer) {
            this.blur_a = [inner, outer];
            const gl = this.gl;
            gl.uniform1f(this.innerBlurALocation, inner);
            gl.uniform1f(this.outerBlurALocation, outer);
        }
    
        setBlurB(inner, outer) {
            this.blur_b = [inner, outer];
            const gl = this.gl;
            gl.uniform1f(this.innerBlurBLocation, inner);
            gl.uniform1f(this.outerBlurBLocation, outer);
        }

        setBackgroundColorA(color) {
            this.background_color_a = color;
            const gl = this.gl;
            gl.uniform3f(this.backgroundColorALocation, color[0], color[1], color[2]);
        }
    
        setBackgroundColorB(color) {
            this.background_color_b = color;
            const gl = this.gl;
            gl.uniform3f(this.backgroundColorBLocation, color[0], color[1], color[2]);
        }
        setBackgroundColorC(color) {
            this.background_color_c = color;
            const gl = this.gl;
            gl.uniform3f(this.backgroundColorCLocation, color[0], color[1], color[2]);
        }
    
        setBackgroundColor(colorA, colorB, colorC) {
            this.background_color_a = colorA;
            this.background_color_b = colorB;
            this.background_color_c = colorC;
            const gl = this.gl;
            gl.uniform3f(this.backgroundColorALocation, colorA[0], colorA[1], colorA[2]);
            gl.uniform3f(this.backgroundColorBLocation, colorB[0], colorB[1], colorB[2]);
            gl.uniform3f(this.backgroundColorCLocation, colorC[0], colorC[1], colorC[2]);
        }
    
        sound_interaction() {
            let variance = 0;
            let temp_size;
            if (this.audio_bound && (this.audio.playState === "playing" || this.audio.paused === false)) {
                this.analyser.getByteFrequencyData(this.dataArray);
                variance = Math.max(this.dataArray[2] / 2 - 50, 0);
                this.smooth_variance = this.smooth_variance * 0.9 + variance * 0.1;
            }
            else{
                this.smooth_variance = 0;
            }
            temp_size = this.radius + this.smooth_variance;
            const gl = this.gl;
            gl.uniform1f(this.radiusLocation, temp_size);
        }
    
        render(time) {
            const gl = this.gl;
            time *= 0.001;
    
            gl.uniform2f(this.resolutionLocation, gl.canvas.width, gl.canvas.height);
            gl.uniform1f(this.timeLocation, time);
            if(this.audio_bound){
                this.sound_interaction();
            }
    
            gl.drawArrays(gl.TRIANGLES, 0, 6);
    
            requestAnimationFrame(this.render.bind(this));
        }
    }
    function run() {
        let canvas = document.getElementById("the_circle_canvas")   //HTML의 캔버스 태그를 가져옴
        circle = new TheCircle(canvas);                                   //TheCircle 객체 생성
        circle.render(0);                                              //시작 시 render 함수를 호출하여 캔버스에 그림을 그림
        document.body.scrollTop = 0;
    }
    window.onload = function () {   //페이지 로드시 실행
        run();
    }


    /* delay */
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
        // data processing
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
        // data processing
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
        // data processing
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
        document.getElementById("ko").innerText = "당신이 완료한 가장 높은 교육 수준은 무엇입니까?";  // questionSeq = 3
        document.getElementById("en").innerText = "What is the highest degree or level of education you have completed?";
        return regionScore;
    }
    // input 받아 questionSeq = 4, Lv1_Q4() 시작
    // Lv1_Q4. What is the highest degree or level of education you have completed?
    function Lv1_Q4(input) {
        // progress bar
        fnStep1();
        // data processing
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
        document.getElementById("ko").innerText = "결혼했습니까?";  // questionSeq = 4
        document.getElementById("en").innerText = "Are you married?";
        return degreeScore;
    }
    // input 받아 questionSeq = 5, Lv1_Q5() 시작
    // Lv1_Q5. Are you married?
    function Lv1_Q5(input) {
        // progress bar
        fnStep1();
        // data processing
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
        // data processing
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
        // data processing
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
        // data processing
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
        // data processing
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
        // data processing
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
            data: JSON.stringify({ data: input}),
        }).done(function(data){
            document.getElementById("ko").innerText = "당신의 내면은 어떤 색인지 설명해주시겠습니까?";  // questionSeq = 9
            document.getElementById("en").innerText = "Could you explain what color you have on the inside?";
            return lv3q1_input;
        });
    }
    // input 받아 questionSeq = 10, Lv3_Q2() 시작
    // Lv3_Q2. 당신의 내면은 어떤 색깔인지 설명해줄래요?
    function Lv3_Q2(input) {
        // progress bar
        fnStep3();
        // ******** input 값을 영어로 번역한 후, aifunction.py 파일의 hexcode() 함수의 인자로 전달해야 합니다. ********
        // ******** python 파일 내 hexcode() 함수의 return 값을 받아와 변수 hexcode에 저장해야 합니다. ********
        document.getElementById("ko").innerText = "내가 당신을 몇 퍼센트 이해할 수 있다고 생각합니까?";  // questionSeq = 9
        document.getElementById("en").innerText = "What percentage do you think I can understand you?";
    }
    // input 받아 questionSeq = 11, Lv3_Q3() 시작
    // Lv3_Q3. 내가 당신을 몇 퍼센트 이해할 수 있다고 생각하나요?
    function Lv3_Q3(input) {
        // progress bar
        fnStep3();
        // data processing
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
        document.getElementById("ko").innerText = "평생 누구에게도 말하지 않은 비밀이 있습니까?";  // questionSeq = 11
        document.getElementById("en").innerText = "Do you have any secret that you've never told anyone?";
        return percentScore;
    }
    // input 받아 questionSeq = 12, Lv3_Q4() 시작
    // Lv3_Q4. 당신이 평생 누구에게도 말하지 않은 비밀이 있나요?
    function Lv3_Q4(input) {
        // progress bar
        fnStep3();
        // data processing
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
        // data processing
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
            Lv3outputEn = "a straightforward and outspoken person just like the scent of peppermint strong and refreshing";
        } else if (Lv3sum < 2) {
            Lv3outputKo = "나 자신에게 그 누구보다 솔직한";
            Lv3outputEn = "honest with myself than anyone else";
        } else if (Lv3sum >= 2 && Lv3sum < 3) {
            Lv3outputKo = "눈빛에서 진실함이 묻어나오는";
            Lv3outputEn = "with eyes telling the truth";
        } else if (Lv3sum >= 3 && Lv3sum < 4) {
            Lv3outputKo = "내면이 흑과 백으로 섞여서 오묘한 빛을 내는";
            Lv3outputEn = "creating a mysterious glow with a mixture of black and white";
        } else if (Lv3sum >= 4 && Lv3sum < 5) {
            Lv3outputKo = "소중하게 간직한 내면의 비밀이 있는";
            Lv3outputEn = "having a secret that you cherish";
        } else if (Lv3sum >= 5 && Lv3sum < 6) {
            Lv3outputKo = "비밀스러운 기억으로 속이 꽤나 시끄러운";
            Lv3outputEn = "with secret memories may make noise due to them";
        } else {
            Lv3outputKo = "무섭도록 정교한 고독을 품은";
            Lv3outputEn = "chillingly lonely";
        }
        outputSentenceKo = "당신은 " + Lv1outputKo + ", " + Lv2outputKo + ", 그리고 " + Lv3outputKo + " 사람이네요.";
        // ***** outputSentenceEn 값을 aifunction.py 파일의 sentences() 함수의 인자로 전달해야 합니다. *****
        // ***** aifunction.py 파일의 sentences() 함수 return 값을 각각 영어, 한국어 번역본으로 javascript 파일에 받아와 변수 outputGPTEn, outputGPTKo에 저장해야 합니다. *****
        outputSentenceEn = "You are a person who is " + Lv1outputEn + ", " + Lv2outputEn + ", " + Lv3outputEn + ".";
        outputGPTEn = "";
        outputGPTKo = "";
        // print format
        document.getElementById("outputKo1").innerText = Lv1outputKo;
        document.getElementById("outputEn1").innerText = Lv1outputEn;
        document.getElementById("outputKo2").innerText = Lv2outputKo;
        document.getElementById("outputEn2").innerText = Lv2outputEn;
        document.getElementById("outputKo3").innerText = Lv3outputKo;
        document.getElementById("outputEn3").innerText = Lv3outputEn;
        // previous variable data initialization: 변수에 저장된 이전 값 초기화
        gender = -1; age = -1; region = -1; degree = -1; marriage = -1; love = -1; hate = -1; friend = -1; weather = -1; important = -1;
        genderScore = -1; ageScore = -1; regionScore = -1; degreeScore = -1; marriageScore = -1; loveScore = 0; hateScore = 0; friendScore = 0; weatherScore = 0; importantScore = 0; percentScore = -1; secretScore = -1;
        return [outputSentenceKo, outputSentenceEn];
    }


    /* Lv1-3 질문 순서대로 출력 */
    var hexcode = "";
    let questionSeq = 0;
    document.getElementById("ko").innerText = "당신은 스스로를 어떤 성별로 식별합니까?";
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
                    2: ["어떤 계절을 좋아합니까?", "What is your favorite season?"],
                    3: ["인생에서 가장 중요하게 생각하는 것은 무엇입니까?", "What is the most important value in your life?"],
                    4: ["진정한 친구는 몇 명입니까?", "How many people can you rely on?"]
                }
                if (questionSeq == 5) {
                    Lv1_Q5(input);
                    document.getElementById("progress-bar").style.visibility ='hidden';
                    document.getElementById("continue").style.display ='none';
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 100); inputintervalID = setInterval(inputFadeOut, 100);});
                    // circle radius, color change
                    circle.setRadius(70);
                    circle.setColorA([0.26, 0.07, 0.25]);
                    circle.setColorB([0.77, 0.66, 0.34]);
                    sleep(2000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "당신에 대한 기본적인 것은 알겠어요. 그래도 당신을 조금만 더 알아보고 싶군요.")
                        .then(() => document.getElementById("en").innerText = "I understand the basics about you. But, let me figure you out more.")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                            .then(() => sleep(2000)
                                .then(() => document.getElementById("progress-bar").style.visibility ='visible')
                                .then(() => document.getElementById("answer").style.display = 'block')
                                .then(() => document.getElementById("ko").innerText = Lv2_Q[randomNums[0]][0])
                                .then(() => document.getElementById("en").innerText = Lv2_Q[randomNums[0]][1])
                                .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100); inputintervalID = setInterval(inputFadeIN, 100)}))
                                .then(() => sleep(1000)
                                    .then(() => document.getElementById("continue").style.display = 'block')
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
                    document.getElementById("progress-bar").style.visibility ='hidden';
                    document.getElementById("continue").style.display ='none';
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 100); inputintervalID = setInterval(inputFadeOut, 100);});
                    circle.setRadius(110);
                    circle.setColorA([0.03, 0.00, 0.47]);
                    circle.setColorB([0.52, 0.93, 0.95]);
                    sleep(2000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "당신, 흥미롭군요. 마지막으로 조금만 더 물어보겠습니다.")
                        .then(() => document.getElementById("en").innerText = "How interesting you are! I want to learn more about you.")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                            .then(() => sleep(2000)
                                .then(() => document.getElementById("progress-bar").style.visibility ='visible')
                                .then(() => document.getElementById("answer").style.display = 'block')
                                .then(() => document.getElementById("ko").innerText = "당신이 생각하는 당신은 어떤 사람입니까?")
                                .then(() => document.getElementById("en").innerText = "What kind of person do you think you are?")
                                .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100); inputintervalID = setInterval(inputFadeIN, 100)}))
                                .then(() => sleep(1000)
                                    .then(() => document.getElementById("continue").style.display = 'block')
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
                        document.getElementById("progress-bar").style.display ='none';
                        document.getElementById("the_circle_canvas").style.display ='none';
                        document.getElementById("output").style.display ='none';
                        document.getElementById("continue").style.display ='none';
                        // ******** python 파일 내 hexcode() 함수의 return 값을 받아 document.body.style.backgroundColor 값을 변경해야 합니다. ********
                        document.body.style.backgroundColor = '#0000CD'; 

                        const content = 
                            'c̵o̸n̸s̴t̴ ̸i̴n̶p̴u̷t̶F̶i̵e̸l̷d̸ ̵=̷ ̸d̴o̵c̴u̵m̷e̵n̷t̴.̴g̸e̸t̶E̶l̶e̴m̴e̶n̶t̴B̶y̵I̵d̵(̸"̸i̴n̶p̵u̷t̷"̵)̶;̷\n'
                            + ' ̷ ̷ ̸ ̴ ̶i̶n̶p̴u̸t̶F̸i̵e̴l̴d̷.̶a̷d̴d̵E̴v̴e̴n̴t̶L̶i̶s̶t̴e̶n̷e̴r̵(̵"̴k̵e̵y̷d̶o̷w̷n̶"̷,̴ ̸f̵u̵n̶c̶t̴i̵o̶n̴(̶e̸)̶ ̵{̶\n'
                            + ' ̷ ̷ ̴ ̸ ̵ ̸ ̴ ̶ ̷i̵f̸ ̸(̸e̷.̸k̶e̷y̷C̸o̵d̷e̸ ̶=̵=̴ ̶1̵3̸)̸ ̵{̶\n'
                            + ' ̶ ̷ ̶ ̸ ̸ ̶ ̵ ̵ ̸ ̵ ̵ ̸ ̷q̸u̵e̶s̷t̶i̶o̷n̶S̶e̵q̴+̴+̷;̵\n'
                            + ' ̷ ̴ ̷ ̸ ̴ ̷ ̸ ̵ ̵ ̷ ̶ ̸ ̴l̴e̸t̴ ̴i̵n̴p̷u̸t̴ ̶=̴ ̶i̴n̸p̵u̵t̸F̷i̴e̷l̵d̷.̶v̴a̸l̴u̸e̴;̸\n';
                        /*
                                ̶ ̷ ̶ ̴ ̵ ̶ ̷ ̴ ̵ ̶ ̴ ̴ ̷i̷n̴p̴u̴t̶F̸i̷e̸l̶d̶.̵v̵a̷l̷u̷e̵ ̷=̷ ̷\"̶\"̶;̴
                                ̷ ̷ ̶ ̶ ̵ ̷ ̶ ̵ ̸ ̴ ̶ ̷ ̷i̴f̷ ̷(̵q̵u̴e̵s̸t̸i̶o̶n̵S̶e̴q̶ ̵=̵=̴ ̵1̵)̶ ̵{̵L̸v̸1̵_̷Q̷1̷(̶i̷n̵p̴u̴t̵)̴;̴}̸
                                ̸ ̵ ̵ ̴ ̵ ̵ ̶ ̷ ̴ ̴ ̵ ̷ ̴i̸f̴ ̴(̸q̵u̵e̶s̸t̴i̶o̴n̶S̶e̸q̴ ̸=̵=̶ ̵2̷)̶ ̸{̴L̸v̷1̴_̷Q̶2̶(̶i̴n̵p̸u̷t̷)̸;̴}̷
                                ̵ ̵ ̴ ̵ ̴ ̶ ̸ ̷ ̴ ̴ ̶ ̴ ̸i̸f̸ ̸(̵q̵u̸e̵s̵t̴i̵o̵n̸S̴e̴q̵ ̸=̵=̴ ̷3̶)̷ ̷{̶L̵v̷1̵_̴Q̶3̵(̴i̸n̷p̴u̴t̵)̴;̶}̴
                                ̵ ̵ ̴ ̴ ̶ ̸ ̵ ̴ ̸ ̵ ̴ ̵ ̷i̸f̷ ̸(̶q̶u̸e̵s̸t̵i̸o̶n̷S̷e̷q̸ ̸=̴=̷ ̸4̷)̷ ̶{̴L̷v̶1̴_̷Q̵4̸(̶i̴n̵p̷u̵t̶)̶;̶}̶
                                ̸ ̶ ̸ ̸ ̵ ̴ ̴ ̵ ̷ ̸ ̷ ̵ ̴i̵f̸ ̴(̶q̵u̵e̷s̴t̷i̵o̵n̵S̷e̴q̷ ̴>̷=̶ ̴5̴)̷ ̸{̴̷
                                ̶ ̷ ̷ ̸ ̵ ̴ ̶ ̵ ̴ ̷ ̶ ̷ ̴ ̶ ̷ ̵ ̸i̸f̴ ̵(̵q̷u̸e̵s̷t̶i̸o̷n̶S̶e̶q̶ ̵=̶=̶ ̸5̵)̴ ̷{̶
                                ̶ ̶ ̴ ̷ ̵ ̷ ̴ ̵ ̶ ̵ ̴ ̵ ̴ ̸ ̸ ̷ ̷ ̶ ̶ ̶ ̵L̴v̶1̷_̷Q̸5̸(̴i̵n̶p̸u̶t̶)̴;̷
                                ̶ ̸ ̴ ̶ ̶ ̵ ̸ ̵ ̴ ̴ ̷ ̵ ̶ ̸ ̶ ̶ ̵ ̶ ̷ ̵ ̵d̷o̸c̴u̴m̴e̶n̶t̸.̷g̵e̴t̵E̴l̷e̵m̶e̵n̵t̸B̴y̶I̴d̶(̷"̸p̷r̷o̷g̷r̸e̸s̶s̶-̸b̸a̶r̴"̸)̴.̴s̷t̷y̸l̷e̵.̵v̸i̶s̵i̷b̸i̵l̷i̵t̵y̴ ̸=̷'̴h̸i̸d̸d̵e̸n̷'̵;̴
                                ̸ ̴ ̵ ̵ ̵ ̶ ̴ ̵ ̷ ̴ ̷ ̸ ̷ ̵ ̸ ̸ ̶ ̸ ̷ ̷ ̴d̷o̸c̴u̶m̵e̵n̷t̸.̶g̶e̵t̸E̴l̷e̶m̶e̴n̷t̴B̵y̷I̴d̴(̷"̸c̵o̷n̵t̸i̴n̶u̵e̶"̶)̸.̷s̷t̸y̴l̶e̷.̶d̶i̴s̸p̷l̷a̷y̸ ̵≠'̸n̶o̴n̷e̶'̸;̶
                                ̶ ̵ ̷ ̸ ̶ ̶ ̶ ̵ ̵ ̵ ̸ ̶ ̸ ̷ ̴ ̴ ̴ ̶ ̶ ̶ ̷s̸e̵t̵T̴i̶m̵e̴o̶u̸t̸(̶f̸u̴n̵c̵t̸i̶o̷n̸(̷)̸ ̵{̶t̷e̵x̴t̸i̵n̷t̸e̴r̶v̴a̴l̸I̸D̵ ̵=̷ ̴s̶e̶t̷I̴n̴t̶e̷r̶v̸a̶l̶(̵t̸e̶x̷t̴F̷a̷d̶e̷O̶u̷t̵,̴ ̸1̷0̷0̸)̶;̸ ̴i̴n̸p̷u̴t̶i̵n̴t̴e̶r̵v̸a̷l̴I̶D̴ ̸≠ ̵s̴e̸t̸I̷n̴t̵e̷r̴v̶a̸l̵(̸i̶n̸p̶u̴t̶F̴a̸d̸e̸O̷u̶t̶,̶ ̸1̷0̸0̸)̶;̷}̶)̵;̶
                                ̶ ̵ ̵ ̷ ̶ ̵ ̸ ̷ ̴ ̸ ̴ ̵ ̷ ̵ ̵ ̸ ̷ ̴ ̸ ̸ ̷c̸i̵r̵c̸l̴e̴.̴s̵e̵t̴R̷a̵d̶i̵u̴s̴(̴7̶0̷)̴;̷
                                ̷ ̴ ̴ ̴ ̶ ̶ ̴ ̷ ̶ ̶ ̷ ̷ ̷ ̸ ̵ ̸ ̷ ̷ ̵ ̷ ̴c̶i̴r̷c̵l̵e̴.̷s̵e̴t̴C̶o̸l̷o̸r̵A̶(̸[̴0̴.̵2̸6̵,̷ ̷0̶.̶0̷7̷,̵ ̸0̶.̴2̶5̴]̷)̶;̶
                                ̶ ̶ ̸ ̴ ̸ ̸ ̵ ̴ ̴ ̷ ̸ ̴ ̵ ̷ ̶ ̶ ̷ ̶ ̴ ̸ ̸c̸i̸r̴c̵l̵e̶.̶s̸e̷t̴C̵o̶l̶o̶r̸B̶(̵[̷0̶.̷7̴7̶,̵ ̸0̶.̷6̸6̵,̶ ̵0̸.̷3̸4̵]̵)̸;̷
                                ̷ ̴ ̶ ̸ ̸ ̶ ̸ ̴ ̴ ̸ ̷ ̸ ̸ ̷ ̵ ̴ ̷ ̴ ̵ ̷ ̴s̷l̴e̸e̸p̶(̵2̵0̷0̷0̷)̴
                                ̵ ̷ ̴ ̷ ̵ ̷ ̵ ̸ ̵ ̵ ̵ ̸ ̵ ̴ ̶ ̸ ̶ ̶ ̷ ̴ ̵ ̷ ̷ ̸ ̶.̵t̷h̸e̶n̸(̷(̸)̵ ̵=̵>̴ ̷d̶o̶c̷u̸m̵e̶n̵t̶.̵g̴e̷t̴E̴l̶e̵m̶e̵n̶t̵B̵y̷I̵d̶(̴"̷a̵n̷s̸w̴e̴r̸"̶)̷.̷s̷t̶y̶l̴e̴.̷d̴i̸s̵p̸l̵a̵y̷ ̵=̵'̶n̷o̶n̵e̴'̴)̶
                                ̷ ̶ ̴ ̴ ̶ ̴ ̸ ̵ ̸ ̴ ̷ ̶ ̴ ̸ ̴ ̴ ̶ ̵ ̵ ̷ ̸ ̵ ̴ ̸ ̷.̵t̷h̵e̷n̸(̵(̴)̷ ̷=̴≯ ̵d̵o̶c̷u̸m̶e̶n̵t̶.̵g̶e̷t̵E̶l̷e̸m̷e̵n̵t̷B̴y̸I̴d̴(̷"̶k̷o̶"̷)̵.̴i̶n̷n̶e̵r̵T̴e̸x̷t̷ ̷=̵ ̴"̴당̷신̶에̴ ̷대̶한̵ ̸기̶본̶적̵인̴ ̶것̷은̵ ̵알̸겠̵어̶요̶.̸ ̷그̷래̴도̵ ̷당̶신̴을̸ ̶조̴금̵만̶ ̵더̴ ̷알̵아̵보̶고̵ ̶싶̵군̷요̸.̵"̸)̷
                                ̸ ̸ ̵ ̴ ̷ ̸ ̸ ̸ ̸ ̸ ̸ ̷ ̴ ̴ ̷ ̸ ̷ ̵ ̷ ̶ ̷ ̴ ̷ ̶ ̴.̷t̶h̴e̷n̵(̵(̴)̶ ̴=̵>̷ ̴d̷o̴c̶u̸m̶e̴n̶t̷.̷g̷e̷t̷E̵l̵e̶m̵e̸n̶t̸B̵y̸I̴d̶(̷"̸e̶n̴"̶)̴.̶i̶n̷n̶e̵r̴T̷e̵x̸t̴ ̷=̷ ̸"̵I̵ ̷u̸n̷d̶e̴r̵s̵t̵a̷n̴d̷ ̷t̴h̸e̷ ̷b̴a̶s̷i̵c̴s̴ ̷a̵b̶o̵u̶t̶ ̵y̵o̸u̵.̴ ̶B̶u̶t̸,̴ ̴l̷e̸t̵ ̵m̶e̶ ̴f̶i̷g̸u̶r̸e̵ ̵y̷o̷u̵ ̴o̵u̴t̵ ̸m̷o̸r̴e̸.̴"̷)̵
                                ̴ ̷ ̵ ̴ ̶ ̴ ̴ ̵ ̶ ̷ ̶ ̵ ̸ ̸ ̷ ̴ ̶ ̸ ̴ ̶ ̸ ̸ ̸ ̶ ̵.̴t̶h̸e̴n̷(̶(̵)̶ ̸=̵>̶ ̸s̸e̴t̷T̸i̷m̷e̶o̶u̵t̴(̷f̶u̴n̶c̴t̶i̵o̶n̷(̶)̴ ̷{̸t̸e̴x̸t̸i̷n̶t̴e̶r̸v̸a̵l̶I̵D̴ ̷=̵ ̶s̶e̵t̴I̴n̵t̵e̶r̵v̶a̷l̶(̸t̴e̸x̸t̵F̶a̵d̴e̴I̶N̵,̶ ̶1̶0̷0̷)̴}̵)̴)̸
                                ̴ ̷ ̶ ̸ ̸ ̶ ̸ ̸ ̴ ̸ ̶ ̷ ̸ ̵ ̸ ̸ ̷ ̸ ̶ ̷ ̶ ̵ ̴ ̸ ̶.̴t̴h̷e̷n̷(̶(̵)̶ ̵=̷>̶ ̶s̴l̷e̶e̷p̷(̵3̸0̴0̴0̷)̸
                                ̷ ̴ ̵ ̸ ̵ ̸ ̸ ̶ ̴ ̸ ̷ ̵ ̶ ̸ ̵ ̴ ̸ ̵ ̵ ̴ ̵ ̶ ̷ ̸ ̷ ̷ ̵ ̴ ̷.̵t̴h̶e̸n̷(̴(̵)̵ ̶=̷>̶ ̴s̷e̴t̵T̴i̵m̴e̸o̵u̶t̸(̸f̶u̴n̸c̴t̶i̵o̵n̵(̸)̴ ̴{̸t̸e̷x̴t̴i̶n̵t̸e̵r̷v̴a̶l̵I̶D̵ ̶=̵ ̶s̵e̶t̷I̶n̴t̷e̸r̷v̸a̶l̶(̷t̵e̷x̷t̷F̸a̴d̴e̶O̶u̷t̴,̸ ̷1̷0̷0̶)̶}̸)̸)̸
                                ̵ ̷ ̴ ̵ ̷ ̸ ̸ ̶ ̷ ̶ ̴ ̶ ̸ ̸ ̶ ̷ ̵ ̵ ̶ ̵ ̷ ̵ ̷ ̴ ̶ ̴ ̵ ̶ ̷.̶t̶h̵e̴n̴(̷(̶)̸ ̵=̴≯ ̵s̷l̸e̸e̸p̸(̸2̷0̷0̴0̴)̷
                                ̶ ̵ ̷ ̶ ̶ ̸ ̸ ̴ ̸ ̴ ̶ ̷ ̵ ̶ ̶ ̶ ̵ ̷ ̵ ̴ ̸ ̸ ̷ ̶ ̶ ̷ ̷ ̶ ̴ ̵ ̷ ̵ ̷.̸t̴h̸e̷n̷(̸(̵)̷ ̵=̵≯ ̷d̸o̵c̵u̸m̷e̸n̸t̵.̶g̴e̸t̶E̵l̵e̵m̴e̴n̶t̵B̸y̸I̴d̴(̷"̷p̷r̸o̸g̷r̴e̶s̵s̴-̷b̸a̶r̷"̷)̴.̵s̷t̶y̶l̵e̸.̷v̸i̵s̵i̵b̴i̵l̸i̸t̴y̵ ̷≠'̵v̸i̶s̷i̷b̸l̶e̸'̶)̸
                                ̶ ̷ ̸ ̵ ̶ ̸ ̷ ̶ ̴ ̷ ̶ ̶ ̴ ̶ ̴ ̵ ̶ ̵ ̶ ̵ ̸ ̷ ̵ ̷ ̶ ̷ ̸ ̸ ̴ ̶ ̷ ̵ ̷.̸t̵h̶e̸n̷(̴(̴)̵ ̷=̴>̶ ̶d̴o̷c̸u̸m̴e̵n̷t̶.̸g̵e̶t̵E̴l̶e̴m̵e̷n̶t̷B̸y̶I̷d̵(̵"̷a̸n̵s̷w̸e̷r̷"̸)̵.̵s̶t̷y̷l̴e̴.̸d̴i̷s̴p̵l̵a̸y̸ ̶≠ ̵'̶b̵l̶o̶c̷k̷'̸)̸
                                ̴ ̵ ̶ ̴ ̵ ̶ ̸ ̸ ̵ ̷ ̵ ̴ ̷ ̸ ̶ ̵ ̷ ̶ ̵ ̴ ̷ ̸ ̷ ̴ ̶ ̶ ̵ ̸ ̵ ̴ ̸ ̴ ̴.̸t̶h̵e̶n̸(̷(̴)̵ ̶=̶>̵ ̸d̸o̷c̵u̴m̶e̷n̵t̷.̷g̷e̴t̸E̷l̴e̵m̵e̶n̴t̴B̴y̶I̶d̸(̷"̶k̷o̴"̵)̴.̷i̵n̴n̵e̷r̷T̷e̵x̴t̴ ̸=̷ ̶L̸v̶2̴_̴Q̷[̷r̷a̴n̶d̵o̴m̶N̴u̵m̴s̶[̴0̵]̷]̵[̶0̷]̵)̵
                                ̸ ̷ ̴ ̶ ̷ ̶ ̶ ̷ ̸ ̶ ̵ ̸ ̶ ̵ ̸ ̶ ̸ ̸ ̵ ̷ ̷ ̴ ̷ ̴ ̸ ̷ ̸ ̶ ̸ ̵ ̷ ̴ ̴.̷t̴h̵e̵n̶(̴(̷)̷ ̸=̵>̷ ̷d̸o̸c̴u̵m̵e̶n̷t̷.̶g̷e̷t̸E̵l̵e̷m̴e̶n̴t̶B̷y̴I̸d̴(̷"̸e̷n̴"̸)̵.̸i̵n̸n̶e̵r̷T̶e̴x̴t̷ ̴=̶ ̷L̸v̷2̷_̶Q̸[̷r̶a̶n̷d̴o̸m̶N̴u̴m̴s̴[̴0̸]̴]̴[̸1̷]̸)̸
                                ̸ ̸ ̶ ̸ ̵ ̵ ̵ ̸ ̵ ̶ ̴ ̵ ̷ ̶ ̵ ̵ ̴ ̶ ̵ ̶ ̸ ̸ ̸ ̴ ̶ ̵ ̶ ̷ ̸ ̷ ̵ ̷ ̵.̷t̵h̸e̷n̵(̵(̸)̵ ̷=̴≯ ̵s̵e̵t̷T̴i̶m̷e̵o̶u̸t̴(̷f̸u̷n̷c̵t̸i̶o̷n̵(̴)̵ ̵{̶t̷e̵x̶t̶i̴n̵t̵e̵r̸v̸a̸l̵I̵D̵ ̷=̷ ̶s̷e̵t̸I̷n̶t̷e̷r̶v̴a̷l̴(̴t̵e̴x̸t̶F̸a̸d̵e̵I̷N̵,̸ ̷1̷0̶0̷)̶;̸ ̶i̸n̶p̷u̴t̵i̶n̵t̶e̷r̷v̴a̵l̶I̵D̵ ̴=̶ ̴s̵e̷t̵I̸n̸t̵e̴r̵v̴a̷l̸(̴i̵n̵p̴u̴t̶F̵a̷d̸e̷I̶N̶,̴ ̷1̷0̴0̵)̷}̷)̵)̸
                                ̶ ̷ ̵ ̵ ̷ ̸ ̴ ̶ ̶ ̸ ̸ ̷ ̸ ̵ ̵ ̸ ̶ ̸ ̶ ̵ ̸ ̴ ̶ ̷ ̴ ̷ ̸ ̶ ̸ ̴ ̴ ̴ ̶.̶t̷h̵e̴n̵(̶(̸)̵ ̸=̷>̷ ̴s̷l̸e̶e̴p̸(̵1̷0̸0̷0̸)̷
                                ̵ ̷ ̶ ̵ ̸ ̸ ̶ ̷ ̷ ̵ ̵ ̶ ̸ ̶ ̴ ̵ ̵ ̷ ̸ ̸ ̷ ̵ ̶ ̸ ̸ ̵ ̶ ̶ ̵ ̸ ̵ ̶ ̶ ̶ ̷ ̴ ̸.̵t̸h̸e̶n̶(̴(̸)̸ ̴=̵>̴ ̸d̸o̷c̷u̷m̴e̶n̵t̶.̷g̶e̴t̶E̸l̴e̴m̵e̵n̷t̸B̶y̸I̸d̷(̸"̷c̴o̷n̷t̷i̷n̶u̸e̸"̷)̴.̷s̶t̷y̷l̴e̷.̴d̸i̸s̸p̷l̴a̷y̸ ̵=̵ ̴'̴b̷l̵o̵c̷k̷'̵)̵
                                ̸ ̶ ̵ ̶ ̴ ̸ ̴ ̸ ̸ ̴ ̷ ̴ ̶ ̴ ̸ ̴ ̶ ̶ ̶ ̵ ̴ ̶ ̶ ̸ ̸ ̸ ̸ ̶ ̴ ̵ ̶ ̶ ̶)̸
                                ̸ ̶ ̷ ̶ ̶ ̵ ̶ ̴ ̸ ̶ ̵ ̵ ̸ ̸ ̸ ̸ ̷ ̸ ̵ ̴ ̵ ̷ ̷ ̸ ̶ ̸ ̸ ̶ ̴)̴
                                ̶ ̴ ̴ ̵ ̸ ̷ ̵ ̴ ̸ ̶ ̵ ̶ ̴ ̸ ̶ ̵ ̵ ̵ ̸ ̶ ̵ ̸ ̵ ̸ ̵)̶
                                ̶ ̸ ̵ ̴ ̷ ̷ ̸ ̵ ̵ ̷ ̸ ̶ ̴ ̴ ̴ ̸ ̴}̵
                                ̴ ̶ ̴ ̴ ̷ ̵ ̸ ̸ ̷ ̶ ̵ ̶ ̶ ̶ ̶ ̸ ̷i̶f̸ ̷(̵q̵u̴e̷s̵t̴i̸o̶n̸S̵e̸q̴ ̸=̶=̴ ̷6̷)̴ ̶{̴
                                ̵ ̴ ̴ ̵ ̸ ̵ ̸ ̵ ̴ ̴ ̸ ̴ ̴ ̸ ̶ ̷ ̷ ̵ ̷ ̵ ̷i̶f̵ ̴(̴r̶a̴n̸d̶o̵m̷N̸u̷m̸s̷[̸0̴]̸ ̴=̶=̵ ̷0̸)̶ ̸{̴L̷v̷2̶_̵Q̸1̷(̴i̸n̶p̵u̶t̸)̵;̴}̷
                                ̶ ̸ ̸ ̷ ̶ ̵ ̵ ̸ ̴ ̸ ̸ ̷ ̶ ̷ ̶ ̶ ̴ ̴ ̵ ̷ ̸i̸f̷ ̵(̶r̴a̷n̵d̶o̶m̸N̸u̷m̷s̶[̷0̵]̴ ̷=̶≠ ̷1̸)̶ ̶{̵L̶v̵2̴_̵Q̷2̵(̸i̸n̶p̶u̶t̴)̷;̶}̵
                                ̸ ̶ ̸ ̷ ̷ ̵ ̵ ̷ ̶ ̸ ̴ ̵ ̴ ̴ ̷ ̴ ̵ ̵ ̵ ̷ ̸i̷f̷ ̴(̶r̷a̵n̶d̴o̵m̵N̶u̸m̸s̵[̵0̸]̵ ̵=̵=̷ ̷2̴)̴ ̶{̷L̷v̵2̵_̵Q̵3̶(̷i̴n̷p̸u̸t̵)̶;̶}̶
                                ̶ ̴ ̶ ̴ ̶ ̴ ̴ ̶ ̶ ̷ ̸ ̴ ̶ ̸ ̶ ̴ ̶ ̸ ̷ ̵ ̴i̶f̷ ̸(̵r̴a̶n̴d̷o̶m̶N̷u̴m̵s̸[̶0̶]̵ ̶=̶=̶ ̴3̵)̶ ̴{̸L̴v̸2̵_̸Q̵4̸(̸i̷n̴p̶u̵t̴)̵;̴}̷
                                ̵ ̷ ̶ ̵ ̸ ̸ ̶ ̵ ̶ ̶ ̸ ̸ ̸ ̵ ̴ ̵ ̵ ̴ ̴ ̴ ̴i̵f̴ ̴(̵r̸a̸n̵d̶o̵m̷N̷u̶m̸s̸[̸0̷]̸ ̶=̴=̴ ̸4̶)̷ ̷{̸L̴v̶2̵_̸Q̸5̷(̶i̸n̵p̶u̸t̶)̵;̵}̸
                                ̶ ̴ ̷ ̸ ̴ ̸ ̶ ̷ ̴ ̶ ̸ ̸ ̷ ̴ ̵ ̶ ̷ ̴ ̵ ̶ ̵/̶/̸d̸o̴c̴u̶m̶e̶n̶t̷.̵g̵e̶t̸E̴l̴e̶m̵e̷n̸t̴B̴y̷I̶d̶(̶"̷a̷n̶s̴w̶e̸r̸"̸)̸.̶s̷t̴y̵l̵e̶.̴d̶i̴s̶p̸l̶a̶y̶ ̷=̵'̴b̷l̷o̶c̵k̸'̸;̸
                                ̶ ̵ ̶ ̸ ̵ ̶ ̴ ̷ ̸ ̴ ̶ ̸ ̷ ̵ ̸ ̵ ̷ ̴ ̶ ̶ ̵d̷o̷c̴u̸m̷e̷n̴t̵.̷g̷e̸t̵E̵l̵e̸m̸e̷n̵t̶B̶y̶I̸d̶(̵"̸k̸o̷"̷)̴.̷i̴n̶n̶e̷r̵T̴e̷x̵t̷ ̸=̶ ̴L̸v̶2̴_̶Q̵[̸r̸a̶n̴d̵o̵m̷N̷u̴m̶s̷[̵1̶]̵]̸[̵0̸]̵;̴
                                ̷ ̷ ̶ ̴ ̷ ̴ ̴ ̵ ̵ ̶ ̷ ̵ ̶ ̶ ̵ ̸ ̸ ̴ ̵ ̶ ̵d̸o̶c̸u̸m̵e̴n̴t̷.̸g̴e̴t̵E̵l̴e̴m̵e̸n̶t̸B̶y̸I̸d̸(̶"̶e̸n̶"̷)̸.̸i̸n̴n̶e̴r̸T̷e̶x̵t̸ ̶=̵ ̷L̵v̷2̵_̴Q̶[̴r̴a̴n̴d̵o̵m̸N̵u̴m̷s̷[̶1̴]̸]̵[̵1̸]̸;̵
                                ̸ ̴ ̷ ̸ ̷ ̴ ̴ ̵ ̸ ̶ ̶ ̵ ̷ ̴ ̸ ̷ ̶ ̵ ̵ ̷ ̸/̵/̶i̴n̴t̴e̴r̶v̷a̸l̸I̷D̴ ̷=̴ ̶s̷e̵t̷I̷n̷t̴e̵r̵v̶a̵l̸(̴t̵e̷x̴t̵F̵a̸d̷e̶I̶N̸,̶ ̸2̵0̴0̸)̶;̸
                                ̴ ̴ ̴ ̶ ̵ ̵ ̷ ̸ ̸ ̴ ̵ ̴ ̵ ̷ ̷ ̴ ̸}̶
                                ̶ ̴ ̷ ̴ ̷ ̷ ̴ ̴ ̸ ̸ ̴ ̶ ̷ ̶ ̶ ̵ ̶i̵f̷ ̵(̶q̴u̴e̷s̷t̴i̷o̸n̷S̷e̸q̷ ̸=̴=̶ ̵7̵)̶ ̷{̵
                                ̴ ̷ ̶ ̷ ̶ ̶ ̷ ̶ ̵ ̸ ̷ ̵ ̵ ̴ ̵ ̶ ̸ ̶ ̴ ̵ ̴i̴f̶ ̷(̶r̶a̶n̶d̸o̴m̵N̷u̸m̵s̵[̶1̵]̴ ̴=̴=̴ ̶0̷)̶ ̵{̷L̸v̶2̵_̵Q̸1̷(̷i̵n̸p̶u̸t̶)̸;̸}̵
                                ̴ ̴ ̸ ̷ ̷ ̶ ̷ ̸ ̴ ̷ ̴ ̵ ̸ ̴ ̷ ̸ ̸ ̷ ̶ ̶ ̴i̵f̴ ̸(̶r̶a̵n̸d̴o̴m̷N̴u̶m̵s̸[̷1̷]̵ ̴=̷=̶ ̷1̴)̶ ̵{̶L̴v̴2̷_̴Q̴2̵(̵i̴n̵p̸u̴t̴)̸;̵}̶
                                ̵ ̴ ̵ ̶ ̸ ̶ ̶ ̷ ̸ ̴ ̶ ̵ ̷ ̸ ̷ ̴ ̵ ̶ ̴ ̵ ̵i̶f̸ ̸(̵r̸a̸n̵d̸o̴m̶N̴u̴m̸s̴[̵1̸]̶ ̵=̶=̷ ̸2̷)̵ ̶{̵L̸v̶2̷_̸Q̶3̸(̵i̷n̵p̶u̴t̸)̷;̷}̴
                                ̴ ̵ ̴ ̶ ̴ ̶ ̵ ̸ ̵ ̷ ̸ ̸ ̴ ̶ ̴ ̷ ̴ ̸ ̸ ̸ ̷i̶f̶ ̵(̷r̴a̸n̵d̶o̶m̷N̶u̵m̵s̷[̸1̴]̸ ̸=̷=̴ ̶3̶)̴ ̴{̸L̷v̴2̵_̸Q̷4̸(̸i̷n̸p̸u̷t̷)̵;̵}̴
                                ̶ ̶ ̶ ̷ ̶ ̸ ̸ ̷ ̷ ̵ ̵ ̷ ̶ ̴ ̶ ̶ ̸ ̵ ̷ ̶ ̵i̵f̶ ̵(̵r̷a̸n̷d̶o̵m̶N̴u̸m̶s̶[̵1̴]̵ ̷=̶=̵ ̷4̴)̵ ̷{̴L̶v̸2̶_̸Q̶5̵(̷i̷n̶p̸u̶t̴)̵;̸}̵
                                ̸ ̸ ̷ ̸ ̴ ̸ ̶ ̸ ̸ ̴ ̵ ̴ ̵ ̸ ̴ ̵ ̴ ̵ ̵ ̷ ̷d̵o̷c̵u̷m̵e̴n̶t̵.̴g̸e̴t̸E̴l̸e̷m̶e̸n̵t̴B̴y̷I̸d̵(̷"̶k̴o̷"̶)̷.̷i̵n̷n̷e̶r̶T̴e̷x̶t̸ ̴=̴ ̴L̷v̶2̷_̶Q̵[̴r̸a̵n̸d̶o̵m̷N̶u̸m̴s̵[̶2̴]̷]̴[̶0̶]̷;̸
                                ̷ ̸ ̵ ̵ ̷ ̴ ̷ ̴ ̷ ̶ ̷ ̵ ̴ ̷ ̶ ̴ ̴ ̶ ̵ ̷ ̵d̴o̵c̸u̴m̴e̷n̸t̸.̴g̶e̵t̴E̷l̷e̶m̶e̸n̷t̷B̸y̵I̶d̸(̸"̶e̸n̸"̴)̴.̵i̷n̵n̶e̸r̴T̶e̷x̶t̶ ̸=̶ ̵L̶v̸2̵_̶Q̶[̷r̷a̶n̴d̶o̶m̵N̴u̴m̵s̶[̶2̸]̸]̷[̸1̵]̸;̷
                                ̵ ̶ ̷ ̷ ̷ ̸ ̶ ̸ ̶ ̶ ̷ ̷ ̵ ̶ ̵ ̷ ̴}̷
                                ̵ ̴ ̴ ̷ ̸ ̶ ̵ ̵ ̸ ̶ ̶ ̵ ̸ ̷ ̴ ̸ ̶i̷f̸ ̶(̵q̵u̵e̴s̴t̵i̴o̶n̴S̵e̶q̶ ̵=̵=̵ ̶8̸)̷ ̴{̴
                                ̸ ̷ ̴ ̴ ̴ ̵ ̴ ̸ ̶ ̶ ̴ ̴ ̵ ̷ ̸ ̴ ̵ ̷ ̷ ̵ ̸i̴f̷ ̸(̷r̷a̶n̴d̸o̴m̸N̵u̶m̵s̶[̵2̶]̷ ̷=̷≠ ̸0̸)̸ ̴{̷L̷v̷2̷_̶Q̶1̷(̴i̸n̸p̸u̴t̴)̸;̵}̵
                                ̶ ̶ ̴ ̵ ̴ ̴ ̷ ̸ ̶ ̸ ̶ ̸ ̴ ̵ ̴ ̸ ̶ ̸ ̵ ̶ ̸i̵f̴ ̴(̵r̴a̵n̸d̶o̷m̸N̷u̸m̵s̷[̴2̶]̴ ̸=̶=̷ ̸1̶)̵ ̴{̷L̵v̷2̵_̴Q̶2̸(̷i̵n̸p̸u̷t̸)̴;̵}̸
                                ̴ ̶ ̶ ̸ ̶ ̶ ̶ ̶ ̵ ̶ ̷ ̸ ̴ ̶ ̸ ̴ ̵ ̶ ̷ ̴ ̶i̷f̶ ̸(̵r̶a̶n̸d̷o̸m̷N̸u̶m̵s̴[̷2̷]̷ ̵=̵=̴ ̵2̵)̵ ̷{̸L̷v̵2̵_̶Q̶3̷(̶i̸n̵p̴u̵t̶)̵;̷}̸
                                ̷ ̶ ̶ ̸ ̵ ̵ ̵ ̴ ̴ ̸ ̶ ̴ ̵ ̷ ̴ ̵ ̵ ̴ ̴ ̷ ̵i̷f̶ ̴(̸r̶a̸n̵d̸o̶m̶N̵u̵m̵s̶[̷2̴]̴ ̶=̴=̴ ̴3̶)̷ ̵{̸L̵v̵2̷_̶Q̷4̶(̸i̵n̸p̷u̸t̴)̷;̵}̶
                                ̷ ̵ ̸ ̶ ̷ ̸ ̴ ̸ ̴ ̷ ̴ ̴ ̴ ̷ ̸ ̸ ̷ ̵ ̴ ̸ ̴i̶f̵ ̷(̶r̴a̴n̴d̵o̸m̵N̸u̸m̸s̸[̷2̷]̴ ̶=̷=̷ ̴4̴)̶ ̸{̴L̶v̴2̶_̸Q̸5̴(̴i̵n̴p̶u̷t̵)̴;̸}̶
                                ̴ ̸ ̶ ̵ ̷ ̴ ̴ ̴ ̶ ̶ ̶ ̶ ̵ ̴ ̷ ̸ ̴ ̴ ̵ ̷ ̷d̷o̴c̵u̶m̸e̵n̴t̸.̵g̷e̴t̴E̷l̵e̸m̴e̸n̴t̴B̸y̴I̴d̵(̶"̷p̸r̴o̵g̷r̵e̵s̵s̵-̴b̴a̵r̴"̷)̶.̵s̵t̸y̷l̸e̷.̸v̷i̵s̴i̷b̸i̶l̸i̴t̷y̷ ̸=̷'̴h̴i̴d̷d̴e̵n̵'̴;̶
                                ̶ ̷ ̶ ̶ ̵ ̶ ̸ ̷ ̴ ̴ ̴ ̴ ̵ ̵ ̸ ̶ ̷ ̶ ̷ ̷ ̸d̴o̵c̷u̵m̴e̷n̵t̷.̶g̸e̴t̵E̷l̵e̵m̶e̵n̴t̶B̷y̷I̸d̴(̴"̵c̸o̶n̷t̷i̵n̷u̴e̴"̷)̷.̷s̴t̶y̴l̴e̴.̷d̶i̶s̵p̵l̵a̷y̶ ̷≠'̵n̶o̸n̸e̵'̷;̴
                                ̶ ̴ ̴ ̵ ̸ ̶ ̷ ̷ ̴ ̸ ̴ ̴ ̴ ̸ ̸ ̶ ̶ ̵ ̸ ̸ ̶s̸e̷t̸T̸i̴m̸e̸o̶u̵t̶(̸f̷u̵n̵c̶t̴i̴o̶n̵(̶)̸ ̶{̸t̸e̷x̵t̵i̴n̴t̷e̶r̷v̶a̷l̴I̸D̵ ̵=̷ ̶s̷e̵t̴I̶n̸t̴e̴r̶v̶a̴l̸(̷t̴e̴x̶t̴F̵a̵d̴e̷O̵u̷t̷,̷ ̶1̶0̵0̴)̵;̵ ̸i̶n̸p̸u̴t̸i̸n̴t̸e̷r̷v̵a̸l̴I̴D̶ ̵=̴ ̵s̸e̴t̵I̶n̶t̵e̸r̵v̶a̶l̸(̴i̴n̸p̷u̸t̷F̵a̶d̶e̵O̶u̸t̶,̵ ̷1̶0̷0̸)̴;̷}̵)̵;̵
                                ̶ ̶ ̶ ̴ ̷ ̵ ̴ ̴ ̸ ̷ ̴ ̴ ̶ ̴ ̵ ̴ ̸ ̵ ̴ ̸ ̵c̴i̷r̴c̷l̵e̵.̶s̷e̸t̷R̷a̶d̶i̴u̴s̵(̸1̶1̶0̷)̷;̸
                                ̸ ̵ ̴ ̶ ̸ ̸ ̶ ̵ ̶ ̶ ̴ ̷ ̴ ̸ ̸ ̸ ̴ ̵ ̷ ̶ ̴c̸i̴r̶c̶l̶e̸.̶s̸e̷t̶C̸o̴l̴o̸r̴A̵(̴[̴0̵.̵0̷3̸,̸ ̸0̴.̵0̷0̸,̶ ̶0̷.̷4̶7̴]̶)̸;̷
                                ̶ ̴ ̷ ̷ ̷ ̶ ̵ ̵ ̶ ̵ ̷ ̶ ̵ ̶ ̴ ̴ ̴ ̸ ̷ ̸ ̸c̸i̴r̴c̴l̶e̷.̵s̵e̶t̸C̵o̶l̴o̴r̶B̸(̵[̴0̵.̴5̸2̷,̷ ̴0̴.̴9̷3̷,̷ ̸0̴.̵9̸5̴]̷)̷;̵
                                ̴ ̷ ̵ ̸ ̴ ̶ ̵ ̶ ̸ ̸ ̶ ̵ ̴ ̶ ̶ ̵ ̴ ̶ ̴ ̴ ̸s̴l̷e̸e̵p̵(̶2̵0̴0̷0̸)̴
                                ̷ ̷ ̶ ̵ ̸ ̶ ̶ ̵ ̶ ̸ ̴ ̵ ̸ ̶ ̴ ̷ ̴ ̵ ̶ ̷ ̵ ̶ ̵ ̵ ̴.̴t̷h̸e̷n̸(̴(̴)̶ ̶=̶>̵ ̴d̸o̶c̵u̵m̷e̵n̷t̴.̴g̶e̷t̸E̴l̶e̸m̶e̷n̴t̸B̸y̴I̴d̵(̶"̶a̵n̸s̴w̵e̷r̷"̷)̶.̸s̶t̷y̴l̸e̸.̷d̴i̶s̶p̶l̷a̶y̷ ̶=̵'̶n̶o̸n̷e̸'̴)̷
                                ̵ ̶ ̶ ̶ ̸ ̶ ̶ ̴ ̶ ̸ ̶ ̶ ̶ ̴ ̴ ̵ ̸ ̸ ̴ ̴ ̵ ̵ ̶ ̴ ̷.̷t̴h̴e̸n̷(̵(̴)̴ ̷=̵>̵ ̵d̶o̸c̷u̶m̷e̶n̴t̶.̷g̶e̶t̸E̸l̶e̶m̷e̴n̴t̷B̶y̷I̴d̵(̵"̶k̷o̵"̶)̵.̶i̵n̸n̵e̸r̸T̵e̶x̷t̶ ̴=̵ ̶"̷당̸신̸,̴ ̸흥̴미̷롭̶군̴요̵.̶ ̴마̵지̸막̵으̷로̶ ̴조̶금̵만̶ ̵더̷ ̸물̷어̶보̸겠̵습̸니̸다̸.̸"̸)̶
                                ̶ ̷ ̶ ̸ ̴ ̷ ̴ ̶ ̷ ̸ ̶ ̷ ̸ ̸ ̴ ̷ ̶ ̷ ̶ ̸ ̴ ̷ ̶ ̶ ̴.̷t̶h̵e̶n̷(̶(̶)̸ ̵=̶>̵ ̷d̶o̷c̸u̶m̸e̵n̶t̶.̵g̵e̸t̴E̶l̸e̵m̵e̵n̷t̷B̶y̵I̵d̵(̴"̶e̷n̴"̸)̵.̵i̶n̵n̷e̷r̶T̵e̶x̷t̵ ̴=̵ ̵"̶H̵o̷w̸ ̶i̵n̴t̴e̴r̶e̵s̷t̸i̵n̸g̴ ̷y̶o̷u̸ ̸a̵r̶e̴!̴ ̶I̶ ̵w̷a̴n̷t̸ ̴t̵o̷ ̵l̶e̶a̶r̵n̸ ̸m̵o̷r̸e̵ ̷a̴b̵o̴u̷t̵ ̴y̸o̵u̸.̸"̷)̷
                                ̵ ̵ ̴ ̵ ̴ ̷ ̷ ̵ ̵ ̸ ̸ ̵ ̷ ̴ ̸ ̷ ̷ ̵ ̸ ̸ ̸ ̷ ̴ ̴ ̷.̷t̶h̶e̵n̸(̷(̸)̶ ̵=̶>̴ ̵s̸e̴t̶T̴i̸m̸e̴o̵u̴t̴(̴f̶u̵n̸c̷t̵i̶o̷n̴(̷)̶ ̷{̸t̴e̶x̵t̵i̷n̸t̸e̷r̷v̸a̷l̴I̸D̵ ̸=̷ ̸s̸e̷t̵I̷n̷t̷e̷r̴v̶a̵l̵(̸t̴e̵x̷t̶F̸a̶d̸e̵I̸N̵,̸ ̷1̴0̴0̸)̸}̷)̷)̸
                                ̷ ̶ ̵ ̶ ̵ ̷ ̷ ̷ ̴ ̷ ̶ ̷ ̴ ̷ ̴ ̶ ̵ ̶ ̷ ̴ ̸ ̵ ̶ ̵ ̵.̵t̸h̴e̵n̷(̶(̵)̴ ̷=̷>̶ ̷s̶l̷e̶e̷p̸(̶3̶0̵0̷0̸)̷
                                ̵ ̷ ̷ ̸ ̵ ̷ ̸ ̸ ̶ ̷ ̷ ̸ ̵ ̷ ̴ ̵ ̷ ̶ ̴ ̵ ̵ ̶ ̷ ̶ ̶ ̶ ̸ ̶ ̷.̶t̴h̷e̷n̷(̵(̷)̶ ̸=̴>̶ ̷s̸e̶t̶T̴i̸m̸e̵o̴u̶t̴(̴f̵u̵n̵c̷t̷i̷o̴n̸(̷)̶ ̴{̶t̴e̴x̶t̴i̵n̸t̸e̸r̸v̷a̵l̵I̵D̵ ̷≠ ̶s̴e̸t̶I̶n̴t̶e̶r̶v̴a̵l̶(̵t̵e̶x̷t̶F̸a̵d̴e̵O̷u̷t̶,̴ ̵1̴0̸0̵)̸}̷)̶)̵
                                ̴ ̴ ̸ ̸ ̵ ̷ ̶ ̵ ̷ ̸ ̸ ̷ ̷ ̵ ̷ ̶ ̴ ̸ ̷ ̶ ̷ ̷ ̶ ̵ ̶ ̸ ̶ ̶ ̷.̶t̵h̵e̸n̷(̴(̵)̶ ̵=̷>̶ ̴s̵l̷e̴e̸p̴(̷2̴0̴0̵0̷)̴
                                ̴ ̴ ̵ ̷ ̸ ̸ ̴ ̷ ̶ ̶ ̶ ̴ ̵ ̵ ̷ ̵ ̵ ̷ ̵ ̵ ̶ ̸ ̴ ̸ ̷ ̵ ̷ ̸ ̷ ̴ ̸ ̶ ̵.̴t̸h̸e̸n̴(̵(̷)̸ ̴=̵>̴ ̵d̵o̶c̷u̴m̸e̷n̸t̴.̸g̵e̸t̵E̸l̷e̷m̶e̴n̴t̷B̸y̸I̶d̴(̷"̵p̴r̴o̶g̴r̸e̶s̵s̸-̴b̴a̶r̶"̴)̸.̷s̸t̸y̵l̶e̵.̶v̸i̶s̸i̴b̶i̸l̸i̶t̸y̵ ̴=̶'̶v̸i̵s̸i̶b̷l̸e̴'̵)̷
                                ̵ ̸ ̸ ̶ ̵ ̶ ̸ ̵ ̷ ̸ ̷ ̸ ̴ ̷ ̷ ̶ ̵ ̸ ̶ ̸ ̵ ̶ ̸ ̴ ̸ ̴ ̵ ̷ ̶ ̶ ̶ ̷ ̷.̶t̸h̶e̷n̸(̷(̴)̸ ̴=̴>̶ ̴d̵o̴c̶u̶m̷e̷n̸t̶.̴g̷e̷t̷E̸l̵e̵m̵e̵n̶t̵B̵y̶I̷d̵(̴"̸a̷n̴s̶w̴e̶r̷"̵)̷.̶s̶t̴y̴l̷e̵.̵d̶i̷s̴p̶l̵a̷y̴ ̷≠ ̶'̸b̴l̶o̴c̸k̴'̸)̷
                                ̶ ̴ ̶ ̷ ̸ ̵ ̶ ̴ ̴ ̸ ̵ ̵ ̸ ̶ ̸ ̸ ̷ ̷ ̵ ̷ ̷ ̵ ̴ ̵ ̵ ̷ ̷ ̵ ̵ ̷ ̸ ̵ ̵.̵t̶h̵e̵n̵(̸(̵)̵ ̶≠≯ ̵d̶o̷c̶u̸m̷e̴n̶t̷.̵g̵e̷t̵E̵l̸e̸m̸e̴n̷t̴B̶y̴I̷d̶(̸"̶k̴o̸"̸)̶.̶i̴n̴n̶e̴r̷T̶e̶x̸t̷ ̷=̶ ̵"̶당̴신̶이̷ ̵생̸각̶하̵는̴ ̶당̴신̶은̴ ̸어̷떤̵ ̴사̴람̵입̵니̸까̵?̸"̴)̴
                                ̴ ̶ ̵ ̵ ̷ ̴ ̶ ̷ ̶ ̸ ̸ ̷ ̴ ̵ ̵ ̸ ̶ ̵ ̸ ̵ ̶ ̶ ̷ ̸ ̶ ̸ ̷ ̷ ̷ ̸ ̴ ̵ ̶.̶t̵h̴e̸n̷(̸(̶)̷ ̵=̷>̴ ̴d̵o̷c̴u̶m̷e̴n̷t̶.̷g̴e̷t̵E̷l̸e̵m̶e̵n̶t̷B̵y̴I̶d̴(̸"̶e̵n̸"̵)̶.̵i̶n̴n̷e̵r̵T̶e̷x̴t̸ ̶=̷ ̸"̶W̴h̴a̷t̷ ̵k̸i̷n̵d̸ ̴o̸f̵ ̵p̸e̴r̶s̷o̸n̴ ̷d̸o̵ ̵y̴o̶u̸ ̸t̷h̴i̷n̷k̶ ̶y̸o̷u̷ ̷a̸r̷e̸?̴"̸)̴
                                ̵ ̸ ̵ ̴ ̶ ̸ ̴ ̸ ̶ ̵ ̷ ̷ ̶ ̷ ̵ ̴ ̶ ̸ ̷ ̸ ̴ ̸ ̸ ̶ ̶ ̵ ̵ ̶ ̵ ̴ ̸ ̸ ̸.̶t̷h̸e̴n̷(̴(̶)̵ ̸≠>̴ ̸s̴e̷t̷T̷i̷m̴e̶o̴u̷t̶(̸f̶u̴n̴c̶t̷i̴o̶n̸(̸)̶ ̶{̶t̶e̸x̸t̵i̸n̴t̸e̸r̵v̶a̶l̶I̶D̵ ̴=̷ ̴s̸e̸t̷I̴n̴t̴e̸r̴v̸a̸l̸(̸t̸e̴x̴t̵F̷a̸d̶e̸I̶N̴,̸ ̵1̵0̷0̶)̸;̷ ̷i̸n̵p̷u̵t̵i̷n̶t̶e̶r̶v̷a̴l̶I̶D̶ ̶≠ ̵s̸e̵t̸I̷n̶t̸e̵r̸v̸a̷l̴(̸i̵n̷p̷u̴t̵F̷a̵d̸e̸I̴N̴,̷ ̷1̸0̵0̸)̷}̶)̵)̸
                                ̷ ̴ ̴ ̵ ̶ ̴ ̸ ̴ ̶ ̷ ̴ ̷ ̵ ̵ ̵ ̵ ̷ ̵ ̶ ̴ ̸ ̶ ̵ ̴ ̶ ̶ ̸ ̸ ̸ ̸ ̵ ̵ ̵.̶t̵h̴e̴n̷(̴(̸)̵ ̸=̷>̴ ̵s̸l̴e̵e̸p̴(̵1̴0̶0̶0̸)̴
                                ̴ ̷ ̷ ̶ ̴ ̶ ̷ ̵ ̸ ̸ ̷ ̸ ̸ ̴ ̷ ̵ ̵ ̷ ̷ ̴ ̴ ̸ ̴ ̴ ̷ ̶ ̴ ̶ ̶ ̵ ̶ ̵ ̶ ̶ ̷ ̷ ̷.̵t̷h̷e̸n̴(̵(̷)̸ ̸=̴>̷ ̵d̸o̷c̷u̷m̵e̷n̸t̷.̶g̶e̶t̴E̸l̶e̸m̵e̸n̷t̸B̶y̴I̷d̴(̷"̶c̶o̷n̴t̶i̶n̶u̵e̴"̸)̴.̶s̸t̸y̸l̵e̸.̶d̴i̵s̵p̷l̸a̴y̴ ̴=̵ ̴'̴b̷l̵o̶c̶k̷'̷)̵
                                ̵ ̸ ̷ ̷ ̷ ̸ ̴ ̷ ̷ ̷ ̷ ̵ ̵ ̷ ̷ ̶ ̸ ̷ ̴ ̸ ̸ ̶ ̷ ̴ ̵ ̴ ̴ ̴ ̷ ̷ ̸ ̵ ̵)̶
                                ̶ ̵ ̷ ̵ ̴ ̷ ̸ ̸ ̸ ̷ ̶ ̵ ̴ ̸ ̸ ̶ ̵ ̸ ̴ ̴ ̶ ̸ ̶ ̴ ̷ ̵ ̵ ̶ ̸)̸
                                ̴ ̸ ̵ ̸ ̴ ̴ ̴ ̶ ̵ ̵ ̶ ̷ ̸ ̵ ̸ ̴ ̴ ̵ ̵ ̴ ̷ ̶ ̸ ̴ ̸)̶
                                ̷ ̶ ̸ ̸ ̵ ̷ ̵ ̸ ̶ ̸ ̸ ̴ ̴ ̶ ̸ ̷ ̵}̷
                                ̶ ̵ ̸ ̵ ̵ ̷ ̴ ̷ ̶ ̶ ̴ ̸ ̶ ̴ ̴ ̵ ̸i̵f̶ ̶(̷q̴u̶e̶s̷t̶i̸o̷n̵S̶e̶q̴ ̵≠=̷ ̵9̷)̵ ̴{̸L̷v̴3̴_̵Q̴1̴(̸i̴n̶p̶u̷t̵)̷;̸}̶
                                ̸ ̷ ̵ ̶ ̷ ̵ ̸ ̴ ̸ ̵ ̶ ̸ ̷ ̴ ̷ ̶ ̷i̴f̸ ̴(̸q̵u̴e̸s̴t̷i̷o̴n̶S̷e̵q̵ ̶=̶=̴ ̸1̵0̷)̵ ̶{̷L̷v̶3̵_̵Q̶2̷(̷i̴n̶p̸u̵t̸)̴;̷}̸
                                ̴ ̸ ̴ ̵ ̷ ̷ ̴ ̸ ̸ ̷ ̸ ̶ ̶ ̷ ̴ ̴ ̸i̷f̶ ̵(̴q̶u̴e̷s̷t̶i̵o̴n̵S̷e̴q̴ ̸=̴=̴ ̴1̷1̴)̵ ̵{̷L̷v̶3̸_̶Q̴3̸(̸i̵n̵p̵u̴t̸)̴;̷}̶
                                ̴ ̸ ̶ ̴ ̷ ̵ ̵ ̶ ̸ ̴ ̷ ̵ ̴ ̵ ̵ ̵ ̶i̷f̷ ̶(̵q̸u̸e̴s̶t̷i̴o̴n̴S̴e̸q̷ ̵≠=̴ ̴1̴2̶)̴ ̶{̶
                                ̷ ̷ ̶ ̸ ̷ ̶ ̶ ̴ ̵ ̷ ̶ ̸ ̵ ̵ ̶ ̶ ̷ ̶ ̷ ̶ ̵L̷v̵3̵_̴Q̷4̴(̷i̷n̵p̷u̴t̴)̸;̶
                                */
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
                        document.getElementById("progress-bar").style.display ='block';
                        document.getElementById("progress-bar").style.visibility ='hidden';
                        document.getElementById("the_circle_canvas").style.display ='block';
                        document.getElementById("output").style.display ='block';
                        document.body.style.backgroundColor = '#000000';
                    }
                    function transitionVideo() {
                        document.getElementById("transition").style.display ='none';
                        document.getElementById('transitionVideo').style.display = 'block';
                        document.getElementById('transitionVideo').style.height = String(window.innerHeight)+"px";
                        document.getElementById('transitionVideo').play();
                    }
                    let [outputKo, outputEn] = output();
                    document.getElementById("progress-bar").style.visibility ='hidden';
                    document.getElementById("continue").style.display ='none';
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 100); inputintervalID = setInterval(inputFadeOut, 100);});
                    sleep(2000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "좋아요! 당신의 말하지 않은 내면을 들여다볼게요.")
                        .then(() => document.getElementById("en").innerText = "Briiliant! Let me see take a look at your unsaid inner world.")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => toTransition())
                            .then(() => sleep(7000)
                                .then(() => transitionVideo())
                                .then(() => sleep(17000)
                                    .then(() => circle.setColorA([0.00, 0.00, 0.71]))
                                    .then(() => circle.setColorB([0.00, 1.00, 1.00]))
                                    .then(() => fromTransition())
                                    .then(() => document.getElementById("ko").innerText = "오늘 우리가 나눈 이야기들로 나는 당신을 완전히 이해했어요.")
                                    .then(() => document.getElementById("en").innerText = "Through the stories we shared today, I completely understand you.")
                                    .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                                    .then(() => sleep(3000)
                                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                                        .then(() => sleep(2000)
                                            .then(() => document.getElementById("ko").innerText = outputKo)
                                            .then(() => document.getElementById("en").innerText = outputEn)
                                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100)}))
                                            .then(() => sleep(4000)
                                                .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                                                .then(() => sleep(2000)
                                                    .then(() => document.getElementById("answer").style.display ='block')
                                                    .then(() => document.getElementById("ko").innerText = "당신의 자아가 내가 말하는 것과 일치합니까?")
                                                    .then(() => document.getElementById("en").innerText = "Do you agree with what I am saying?")
                                                    .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100); inputintervalID = setInterval(inputFadeIN, 100)}))
                                                    .then(() => sleep(1000)
                                                        .then(() => document.getElementById("continue").style.display ='block')
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
                    document.getElementById("continue").style.display ='none';
                    setTimeout(function() {textintervalID = setInterval(textFadeOut, 100); inputintervalID = setInterval(inputFadeOut, 100);});
                    sleep(2000)
                        .then(() => document.getElementById("answer").style.display ='none')
                        .then(() => document.getElementById("ko").innerText = "당신과 만날 수 있어서 기뻤습니다. 이제 뒤로 돌아나가서, 당신의 자아에 대한 영수증을 받아가세요. 안녕히 가세요!")
                        .then(() => document.getElementById("en").innerText = "It was an absolute pleasure speaking with you today. Now, turn around and get a receipt for your ego. Good bye!")
                        .then(() => setTimeout(function() {textintervalID = setInterval(textFadeIN, 100); inputintervalID = setInterval(inputFadeIN, 100)}))
                        .then(() => sleep(3000)
                            .then(() => setTimeout(function() {textintervalID = setInterval(textFadeOut, 100)}))
                            .then(() => sleep(5000)
                                .then(() => window.print())
                                .then(() => window.location.href="start.html")
                            )
                        )
                }
            }
        }       
    });
});