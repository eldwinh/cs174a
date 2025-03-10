var canvas;
var gl;
var time = 0.0;
//var timer = new Timer();

var index = 0;
var bulletMovement = 0;
var type;
var bulletHorizontal = 0;
var bulletVertical = 0;

var score = 0;
var lives = 3;
var temp_score = 0;

var va = vec3(0.0, 0.0, -1.0);
var vb = vec3(0.0, 0.942809, 0.333333);
var vc = vec3(-0.816497, -0.471405, 0.333333);
var vd = vec3(0.816497, -0.471405, 0.333333);
var numAsteroids = 5;
//var reset_asteroid = [vec3(1.0, 0.0, -10.0), vec3(-1.0, 0.0, -10.0), vec3(0.0, 0.0, -10.0)];
var translate_asteroid = [vec3(1.0, 0.0, -10.0), vec3(-1.0, 0.0, -10.0), vec3(0.0, -1.0, -10.0), vec3(0.0, 1.0, -10.0), vec3(0.0, 0.0, -10.0)];
var move_asteroid = vec3(0.0, 0.0, 0.03);
var scale_ship = vec3(0.4, 0.4, 0.4);
var scale_asteroid = vec3(0.3, 0.3, 0.3);
var bulletHit = 0;


var UNIFORM_mvpMatrix;
var UNIFORM_renderType;
var bulletPosition;
var UNIFORM_ambientProduct;
var UNIFORM_diffuseProduct;
var UNIFORM_specularProduct;
var UNIFORM_lightPosition;
var UNIFORM_shininess;
var ATTRIBUTE_position;
var ATTRIBUTE_normal;

var positionBuffer; 
var normalBuffer;
var bBuffer;

var projectionMatrix;
var mvpMatrix;

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var materialAmbient = vec4(1.0, 1.0, 1.0, 1.0);
var ambientProduct = mult(lightAmbient, materialAmbient);

var lightDiffuse = vec4(0.6, 0.6, 0.6, 1.0);
var materialDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);

var lightSpecular = vec4(0.4, 0.4, 0.4, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var specularProduct = mult(lightSpecular, materialSpecular);

var shininess = 50;
var lightPosition = vec3(0.0, 0.0, 0.0);

var eye = vec3(0, 0.7, 1.8);
var at = vec3(0, 0, 0);
var up = vec3(0, 1, 0);

var translateUpandDown = 0;
var translateRightandLeft = 0;
var translateInandOut = 0;
var rotationAmount = 0;
var bulletFired = false;
var program;
var myTexture;
var myTexture1;
var asteroidTexture;
var powerUpTexture;

var points = [];
var normals = [];
var textureCoord = [];

var a_points = [];
var a_normals = [];
var a_uv = [];

var stopGame = false;
var chanceOfPowerUpAppear = false;
var asteroidNumber;
var bombCapacity = 0;
var tempPowerUpPosition;
var clearAndAddToScore;

function spaceCrash()
{
    var spaceshipBlowUp = new Audio("../Images/Bomb.wav");
    spaceshipBlowUp.play();
}

function bulletHitSound()
{
    var bulletHitSound = new Audio("../Images/Bullethit.wav");
    bulletHitSound.play();
}

function backgroundMusic()
{
    var background = new Audio("../Images/SSBMCorneria.wav");
    background.play();
}

function bulletshoot()
{
    var bulletFire = new Audio("../Images/Bulletfire.wav");
    bulletFire.play();
}

function bombpickup()
{
    var bombpickup = new Audio("../Images/bombpickup.wav");
    bombpickup.play();
}

function explode() {
    var explode = new Audio("../Images/explode.wav");
    explode.play();
}
document.addEventListener('keydown', function(event)
{
    switch(event.keyCode)
    {
        case 27: //ESC for stopping the game
            alert(bombCapacity);
        break;
        case 90:
           alert("ver: "+translateUpandDown +" hor:"+translateRightandLeft);
        break;
        case 66: //b
            if(bombCapacity > 0)
            {
                for(var i = 0; i < numAsteroids; i++) {
                    translate_asteroid[i] = vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 10);
                }
                score = score + numAsteroids;
                 $('.score').html("<h3>Score: " + score + "<h3>");
                bombCapacity--;
                explode();
                $('.bomb').html("<h3>Bombs: " + bombCapacity + "<h3>");
            }
        break;
        case 38: //up arrow
            if(translateUpandDown < .9)
                      translateUpandDown += .1;
        break; 
        case 40: //down arrow
            if(translateUpandDown > -1)
                translateUpandDown -= .1;
        break;
        case 39: //right arrow
            if(translateRightandLeft < .75)
                translateRightandLeft += .1;
        break;
        case 37: //left arrow
            if(translateRightandLeft > -.75)
                translateRightandLeft -= .1;
        break;
        case 87: //w
            if(translateInandOut > -.5)
                translateInandOut -= .1;
        break;
        case 83: //s
            if(translateInandOut < .9) 
            translateInandOut += .1;
        break;
        case 65: //a
            rotationAmount -= 5;
        break;
        case 68: //d
            rotationAmount += 5;
        break;
        case 32:
            bulletFired = true;
            if (index == 0 && bulletMovement == 0)
            {
                index = index+1;
                bulletHorizontal = translateRightandLeft;
                bulletVertical = translateUpandDown;
                bulletshoot();
                bBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, bBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
        
                bulletPosition = gl.getAttribLocation( program, "bulletPosition" );
                
                gl.vertexAttribPointer( bulletPosition, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( bulletPosition );
                bulletHit = 0;
            } 
            else if(bulletMovement > 2.0 || bulletHit == 1)
            {
                bulletMovement = 0;
                bulletshoot();
                bulletHorizontal = translateRightandLeft;
                bulletVertical = translateUpandDown;
                bulletHit = 0;
            }
        break;
    }
});

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    backgroundMusic();

    gl.enable(gl.DEPTH_TEST);
    Cube(points, normals, textureCoord);
    Cube1(points1, normals1, textureCoord1);
    createSphere(va, vb, vc, vd, 2);

    myTexture = gl.createTexture();
    myTexture.image = new Image();
    myTexture.image.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, myTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myTexture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    myTexture.image.src = "../Images/Spaceship.png";

    asteroidTexture = gl.createTexture();
    asteroidTexture.image = new Image();
    asteroidTexture.image.onload = function() {
        gl.bindTexture(gl.TEXTURE_2D, asteroidTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, asteroidTexture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    asteroidTexture.image.src = "../Images/asteroids.jpg";

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    UNIFORM_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    UNIFORM_pMatrix = gl.getUniformLocation(program, "pMatrix");
    UNIFORM_ambientProduct = gl.getUniformLocation(program, "ambientProduct");
    UNIFORM_diffuseProduct = gl.getUniformLocation(program, "diffuseProduct");
    UNIFORM_specularProduct = gl.getUniformLocation(program, "specularProduct");
    UNIFORM_lightPosition = gl.getUniformLocation(program, "lightPosition");
    UNIFORM_shininess = gl.getUniformLocation(program, "shininess");
    UNIFORM_sampler = gl.getUniformLocation(program, "uSampler");
    
    myTexture1 = gl.createTexture();
    myTexture1.image1 = new Image();
    myTexture1.image1.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, myTexture1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, myTexture1.image1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    myTexture1.image1.src = "../Images/bullet.jpg";

    powerUpTexture = gl.createTexture();
    powerUpTexture.image1 = new Image();
    powerUpTexture.image1.onload = function(){
        gl.bindTexture(gl.TEXTURE_2D, powerUpTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, powerUpTexture.image1);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
    powerUpTexture.image1.src = "../Images/bomb.png";

    projectionMatrix = perspective(90, 1, 0.001, 1000);
    //projectionMatrix = ortho(-10, 10, -10, 10, 0.001, 1000);

    //timer.reset();
    gl.enable(gl.DEPTH_TEST);

    render();
}

var points1 = [];
var normals1 = [];
var textureCoord1 = [];

function Cube1(points1, normals1, textureCoord1){
    var vertices1 = [
        vec3(.15,.15,.15),
        vec3(.15,-.15,.15),
        vec3(-.15,.15,.15),
        vec3(-.15,-.15,.15),
        vec3(.15,.15,-.15),
        vec3(.15,-.15,-.15),
        vec3(-.15,.15,-.15),
        vec3(-.15,-.15,-.15)
    ];
    Quad(vertices1, points1, normals1, textureCoord1, 0, 1, 2, 3, vec3(0, 0, 1));
    Quad(vertices1, points1, normals1, textureCoord1, 4, 0, 6, 2, vec3(0, 1, 0));
    Quad(vertices1, points1, normals1, textureCoord1, 4, 5, 0, 1, vec3(1, 0, 0));
    Quad(vertices1, points1, normals1, textureCoord1, 2, 3, 6, 7, vec3(1, 0, 1));
    Quad(vertices1, points1, normals1, textureCoord1, 6, 7, 4, 5, vec3(0, 1, 1));
    Quad(vertices1, points1, normals1, textureCoord1, 1, 5, 3, 7, vec3(1, 1, 0));
}

function Quad1( vertices1, points1, normals1, textureCoord1, v1, v2, v3, v4, normal1){

    normals1.push(normal1);
    normals1.push(normal1);
    normals1.push(normal1);
    normals1.push(normal1);
    normals1.push(normal1);
    normals1.push(normal1);

    textureCoord1.push(vec2(0,0));
    textureCoord1.push(vec2(1,0));
    textureCoord1.push(vec2(1,1));
    textureCoord1.push(vec2(0,0));
    textureCoord1.push(vec2(1,1));
    textureCoord1.push(vec2(0,1));

    points1.push(vertices1[v1]);
    points1.push(vertices1[v3]);
    points1.push(vertices1[v4]);
    points1.push(vertices1[v1]);
    points1.push(vertices1[v4]);
    points1.push(vertices1[v2]);
}

function Cube(points, normals, textureCoord){
    vertices = [
        vec3(  .0,   .2, .8 ), //vertex 0 top right front
        vec3(  .15,  -.05, .8 ), //vertex 1 bottom right front
        vec3( -.0,  .2, .8 ), //vertex 2 front top left
        vec3( -.15,  -.05, .8 ),  //vertex 3 front bottom left
        vec3(  .0,   .0, -.0 ), //vertex 4 top back right
        vec3(  .0,  -.0, -.0 ), //vertex 5 bottom back right
        vec3( -.0,   .0, -.0 ), //vertex 6 left top back
        vec3( -.0,  -.0, -.0 )  //vertex 7 left bottom back
    ];
    Quad(vertices, points, normals, textureCoord, 0, 1, 2, 3, vec3(0, 0, 1));
    Quad(vertices, points, normals, textureCoord, 4, 0, 6, 2, vec3(0, 1, 0));
    Quad(vertices, points, normals, textureCoord, 4, 5, 0, 1, vec3(1, 0, 0));
    Quad(vertices, points, normals, textureCoord, 2, 3, 6, 7, vec3(1, 0, 1));
    Quad(vertices, points, normals, textureCoord, 6, 7, 4, 5, vec3(0, 1, 1));
    Quad(vertices, points, normals, textureCoord, 1, 5, 3, 7, vec3(1, 1, 0));
}

function Quad( vertices, points, normals, textureCoord, v1, v2, v3, v4, normal){

    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);
    normals.push(normal);

    textureCoord.push(vec2(0,0));
    textureCoord.push(vec2(1,0));
    textureCoord.push(vec2(1,1));
    textureCoord.push(vec2(0,0));
    textureCoord.push(vec2(1,1));
    textureCoord.push(vec2(0,1));

    points.push(vertices[v1]);
    points.push(vertices[v3]);
    points.push(vertices[v4]);
    points.push(vertices[v1]);
    points.push(vertices[v4]);
    points.push(vertices[v2]);
}

function createSphere(a, b, c, d, n){
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
};

function divideTriangle(a, b, c, count){
    if(count > 0){
        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);
        divideTriangle(a, ab, ac, count - 1);
        divideTriangle(ab, b, bc, count - 1);
        divideTriangle(bc, c, ac, count - 1);
        divideTriangle(ab, bc, ac, count - 1);
    }
    else{
        triangle(a, b, c);
    }
};

function triangle(a, b, c){
    var t1 = subtract(b, a);
    var t2 = subtract(c, a);
    var normal = normalize(cross(t1, t2));
    normal = negate(vec3(normal[0], normal[1], normal[2]));

    a_normals.push(normal);
    a_normals.push(normal);
    a_normals.push(normal);

    a_uv.push(vec2(0,0));
    a_uv.push(vec2(0,1));
    a_uv.push(vec2(1,0));

    a_points.push(a);
    a_points.push(b);
    a_points.push(c);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mvMatrix = lookAt(eye, at, up);

    //////////////////////Spaceship//////////////////////////////////
    positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(textureCoord), gl.STATIC_DRAW);

    ATTRIBUTE_position = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( ATTRIBUTE_position );
    ATTRIBUTE_normal = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( ATTRIBUTE_normal );
    ATTRIBUTE_textureCoord = gl.getAttribLocation( program, "vUV");
    gl.enableVertexAttribArray(ATTRIBUTE_textureCoord);

    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_position, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_normal, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer( ATTRIBUTE_textureCoord, 2, gl.FLOAT, false, 0, 0);

    mvMatrix = mult(mvMatrix, rotate(rotationAmount, [0, 1, 0]));
    mvMatrix = mult(mvMatrix, translate(vec3(translateRightandLeft,translateUpandDown,translateInandOut)));
    mvMatrix = mult(mvMatrix, scale(scale_ship));

    gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

    gl.uniform4fv(UNIFORM_ambientProduct,  flatten(ambientProduct));
    gl.uniform4fv(UNIFORM_diffuseProduct,  flatten(diffuseProduct));
    gl.uniform4fv(UNIFORM_specularProduct, flatten(specularProduct));
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, myTexture);

    gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
    gl.uniform1f(UNIFORM_shininess,  shininess);
    gl.uniform1i(UNIFORM_sampler, 0);

    gl.drawArrays( gl.TRIANGLES, 0, 36);

    if(bulletFired && bulletHit == 0)
    {
        bulletMovement = bulletMovement + 0.1;
        
        mvMatrix = lookAt(eye, at, up);
        mvMatrix = mult(mvMatrix,translate(vec3(bulletHorizontal,bulletVertical,translateInandOut-bulletMovement)));
        mvMatrix = mult(mvMatrix, scale(vec3(0.1, 0.1, 0.1)));

        //Bullet Collision
        for(var i = 0; i < numAsteroids; i++) {
            if(bulletHit == 0
                && (translate_asteroid[i][2] + 0.15) > (-1*bulletMovement)
                && (translate_asteroid[i][2] - 0.15) < (-1*bulletMovement)
                && (translate_asteroid[i][1] - 0.25) < bulletVertical
                && (translate_asteroid[i][1] + 0.25) > bulletVertical
                && (translate_asteroid[i][0] - 0.25) < bulletHorizontal
                && (translate_asteroid[i][0] + 0.25) > bulletHorizontal) {
                bulletHitSound();
                bulletHit = 1;
                score = score + 1;
                temp_score++;
                if(temp_score === 5) {
                    numAsteroids = numAsteroids + 1;
                    move_asteroid[2] = move_asteroid[2] + 0.01;
                    translate_asteroid.push(vec3(Math.random() * 2 - 1, Math.random() * 2 -1, -10));
                    temp_score = 0;
                }
                $('.score').html("<h3>Score: " + score + "<h3>");
                if(-.15 < ((Math.random() * 2 - 1) / 2) && ((Math.random() * 2 - 1) / 2) < 0) //-.5 -> .5 100%
                {
                    if(!chanceOfPowerUpAppear) {
                        chanceOfPowerUpAppear = true;
                        asteroidNumber = i;
                        tempPowerUpPosition = translate_asteroid[asteroidNumber];
                    }

                }
                translate_asteroid[i] = vec3(Math.random() * 2 - 1, Math.random() *2 - 1, -10);
            }
        }

        gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
        gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

        gl.uniform4fv(UNIFORM_ambientProduct,  flatten(ambientProduct));
        gl.uniform4fv(UNIFORM_diffuseProduct,  flatten(diffuseProduct));
        gl.uniform4fv(UNIFORM_specularProduct, flatten(specularProduct));
        gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
        gl.uniform1f(UNIFORM_shininess,  shininess);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, myTexture1);
        gl.uniform1i(UNIFORM_sampler, 0);
        gl.uniform1f(UNIFORM_renderType, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    //asteroid rendering
    positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(a_points), gl.STATIC_DRAW );
    normalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(a_normals), gl.STATIC_DRAW );
    textureCoordBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(a_uv), gl.STATIC_DRAW);

    ATTRIBUTE_position = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( ATTRIBUTE_position );
    ATTRIBUTE_normal = gl.getAttribLocation( program, "vNormal" );
    gl.enableVertexAttribArray( ATTRIBUTE_normal );
    ATTRIBUTE_textureCoord = gl.getAttribLocation( program, "vUV");
    gl.enableVertexAttribArray(ATTRIBUTE_textureCoord);

    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_position, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
    gl.vertexAttribPointer( ATTRIBUTE_normal, 3, gl.FLOAT, false, 0, 0 );
    gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.vertexAttribPointer( ATTRIBUTE_textureCoord, 2, gl.FLOAT, false, 0, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, asteroidTexture);

    for(var i = 0; i < numAsteroids; i++) {
        if(translate_asteroid[i][2] >= 3.0) {
            translate_asteroid[i] = vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, -10.0);
        }
        translate_asteroid[i]=add(translate_asteroid[i], move_asteroid);
        mvMatrix = lookAt(eye, at, up);
        if( ((translate_asteroid[i][2]-.6 < translateInandOut && translateInandOut < translate_asteroid[i][2]) &&
            (translate_asteroid[i][1]-.3 < translateUpandDown && translateUpandDown < translate_asteroid[i][1]+.3) &&
            (translate_asteroid[i][0]-.3 < translateRightandLeft && translateRightandLeft < translate_asteroid[i][0]+.3))
            )
        {
                spaceCrash();
                ///////////RESET EVERYTHING FOR A NEW GAME///////////////
                translateUpandDown = 0;
                translateRightandLeft = 0;
                translateInandOut = 0;
                rotationAmount = 0;
                bulletFired = false;
                if(lives != 0)
                    lives = lives - 1;
                $('.lives').html("<h3>Lives: " + lives + "<h3>");
                if(lives == 0) {
					numAsteroids = 0;
                    $(".app").hide();
                    $(".start").show();
                }
                chanceOfPowerUpAppear = false;
                for( var w = 0; w < numAsteroids; w++)
                    translate_asteroid[w] = vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 10);
        }
        mvMatrix = mult(mvMatrix,translate(translate_asteroid[i]));

        mvMatrix = mult(mvMatrix,scale(scale_asteroid));
        gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
        gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

        for(var j = 0; j < a_points.length; j+=3) {
            gl.drawArrays(gl.TRIANGLES, j, 3);
        }
    }

    if(chanceOfPowerUpAppear)
    {
        //////////////////////PowerUp//////////////////////////////////
        positionBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(points1), gl.STATIC_DRAW );
        normalBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten(normals1), gl.STATIC_DRAW );
        textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(textureCoord1), gl.STATIC_DRAW);

        ATTRIBUTE_position = gl.getAttribLocation( program, "vPosition" );
        gl.enableVertexAttribArray( ATTRIBUTE_position );
        ATTRIBUTE_normal = gl.getAttribLocation( program, "vNormal" );
        gl.enableVertexAttribArray( ATTRIBUTE_normal );
        ATTRIBUTE_textureCoord = gl.getAttribLocation( program, "vUV");
        gl.enableVertexAttribArray(ATTRIBUTE_textureCoord);

        gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
        gl.vertexAttribPointer( ATTRIBUTE_position, 3, gl.FLOAT, false, 0, 0 );
        gl.bindBuffer( gl.ARRAY_BUFFER, normalBuffer );
        gl.vertexAttribPointer( ATTRIBUTE_normal, 3, gl.FLOAT, false, 0, 0 );
        gl.bindBuffer( gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.vertexAttribPointer( ATTRIBUTE_textureCoord, 2, gl.FLOAT, false, 0, 0);

        if(translate_asteroid[asteroidNumber][2] < 3.0) 
            chanceOfPowerUpAppear = true;
        else
        {
            chanceOfPowerUpAppear = false;
        }

        mvMatrix = lookAt(eye, at, up);
        mvMatrix = mult(mvMatrix, translate(tempPowerUpPosition));
        tempPowerUpPosition = add(tempPowerUpPosition, move_asteroid);
        mvMatrix = mult(mvMatrix, scale(vec3(1,1,1)));

        gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
        gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

        gl.uniform4fv(UNIFORM_ambientProduct,  flatten(ambientProduct));
        gl.uniform4fv(UNIFORM_diffuseProduct,  flatten(diffuseProduct));
        gl.uniform4fv(UNIFORM_specularProduct, flatten(specularProduct));
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, powerUpTexture);

        gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
        gl.uniform1f(UNIFORM_shininess,  shininess);
        gl.uniform1i(UNIFORM_sampler, 0);

        gl.drawArrays( gl.TRIANGLES, 0, 36);

        //////////PowerUp Collision//////////
        if( ((tempPowerUpPosition[2]-.6 < translateInandOut && translateInandOut < tempPowerUpPosition[2]) &&
            (tempPowerUpPosition[1]-.25 < translateUpandDown && translateUpandDown < tempPowerUpPosition[1]+.25) &&
            (tempPowerUpPosition[0]-.25 < translateRightandLeft && translateRightandLeft < tempPowerUpPosition[0]+.25))
            )
        {
            bombpickup();
            bombCapacity++;
            $(".bomb").html("<h3>Bombs: " + bombCapacity + "<h3>");
            chanceOfPowerUpAppear = false;
            //Have to delete the object carefully from array after collision

        }

    }

    if(!stopGame)
        window.requestAnimFrame( render );
}
