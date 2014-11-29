var canvas;
var gl;
var time = 0.0;
//var timer = new Timer();

var index = 0;
var bulletMovement = 0;
var type;
var bulletHorizontal = 0;
var bulletVertical = 0;

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
var textureCoord = [];
var myTexture;
var lives = 3;

var points = [];

document.addEventListener('keydown', function(event)
{
    switch(event.keyCode)
    {
        case 90:
            alert("ver: "+translateUpandDown +" hor:"+translateRightandLeft);
        break;
        case 38: //up arrow
            if(translateUpandDown<0.89){translateUpandDown += .1;}
        break; 
        case 40: //down arrow
            if(translateUpandDown>-1){translateUpandDown -= .1;}
        break;
        case 39: //right arrow
            if(translateRightandLeft<0.89){translateRightandLeft += .1;}
        break;
        case 37: //left arrow
            if(translateRightandLeft>-0.89){translateRightandLeft -= .1;}
        break;
        case 87: //w
            translateInandOut -= .1;
        break;
        case 83: //s
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
                bBuffer = gl.createBuffer();
                gl.bindBuffer( gl.ARRAY_BUFFER, bBuffer );
                gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
        
                bulletPosition = gl.getAttribLocation( program, "bulletPosition" );
                
                gl.vertexAttribPointer( bulletPosition, 3, gl.FLOAT, false, 0, 0 );
                gl.enableVertexAttribArray( bulletPosition );
            } 
            else if(bulletMovement > 2.0)
            {
                bulletMovement = 0;
                bulletHorizontal = translateRightandLeft;
                bulletVertical = translateUpandDown;
            }
        break;
    }
});

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    points = [];
    var normals = [];
    Cube(points, normals, textureCoord);

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

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

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

    UNIFORM_mvMatrix = gl.getUniformLocation(program, "mvMatrix");
    UNIFORM_pMatrix = gl.getUniformLocation(program, "pMatrix");
    UNIFORM_ambientProduct = gl.getUniformLocation(program, "ambientProduct");
    UNIFORM_diffuseProduct = gl.getUniformLocation(program, "diffuseProduct");
    UNIFORM_specularProduct = gl.getUniformLocation(program, "specularProduct");
    UNIFORM_lightPosition = gl.getUniformLocation(program, "lightPosition");
    UNIFORM_shininess = gl.getUniformLocation(program, "shininess");
    UNIFORM_sampler = gl.getUniformLocation(program, "uSampler");

    projectionMatrix = perspective(90, 1, 0.001, 1000);

    //timer.reset();
    gl.enable(gl.DEPTH_TEST);

    render();
}

function lives()
{
    return lives;
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


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mvMatrix = lookAt(eye, at, up);

    //time += timer.getElapsedTime() / 1000;

    mvMatrix = mult(mvMatrix, rotate(rotationAmount, [0, 1, 0]));
    mvMatrix = mult(mvMatrix, translate(vec3(translateRightandLeft,translateUpandDown,translateInandOut)));

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

    if(bulletFired)
    {
        bulletMovement = bulletMovement + 0.1;
        
        mvMatrix = lookAt(eye, at, up);
        mvMatrix = mult(mvMatrix,translate(vec3(bulletHorizontal,bulletVertical,translateInandOut-bulletMovement)));
        mvMatrix = mult(mvMatrix, scale(vec3(0.2, 0.2, 0.2)));

        gl.uniformMatrix4fv(UNIFORM_mvMatrix, false, flatten(mvMatrix));
        gl.uniformMatrix4fv(UNIFORM_pMatrix, false, flatten(projectionMatrix));

        gl.uniform4fv(UNIFORM_ambientProduct,  flatten(ambientProduct));
        gl.uniform4fv(UNIFORM_diffuseProduct,  flatten(diffuseProduct));
        gl.uniform4fv(UNIFORM_specularProduct, flatten(specularProduct));
        gl.uniform3fv(UNIFORM_lightPosition,  flatten(lightPosition));
        gl.uniform1f(UNIFORM_shininess,  shininess);
        gl.uniform1f(UNIFORM_renderType, 0.0);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    window.requestAnimFrame( render );
}
