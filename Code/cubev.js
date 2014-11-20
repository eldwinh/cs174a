
var canvas;
var gl;

var numVertices  = 36;

var axis = 0;
var xAxis = 0;
var yAxis =1;
var zAxis = 2;
var theta = [ 0, 0, 0 ];
var thetaLoc;
var modelViewMatrix;
var horizontal=0;
var bulletHorizontal = 0;
var index = 0;
var bulletMovement = 0;
var type;

    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),
        vec3( -0.5,  0.5,  0.5 ),
        vec3(  0.5,  0.5,  0.5 ),
        vec3(  0.5, -0.5,  0.5 ),
        vec3( -0.5, -0.5, -0.5 ),
        vec3( -0.5,  0.5, -0.5 ),
        vec3(  0.5,  0.5, -0.5 ),
        vec3(  0.5, -0.5, -0.5 )
    ];

    var vertexColors = [
        vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
        vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
        vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
        vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
        vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
        vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
        vec4( 1.0, 1.0, 1.0, 1.0 ),  // white
        vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
    ];

// indices of the 12 triangles that compise the cube

var indices = [
    1, 0, 3,
    3, 2, 1,
    2, 3, 7,
    7, 6, 2,
    3, 0, 4,
    4, 7, 3,
    6, 5, 1,
    1, 2, 6,
    4, 5, 6,
    6, 7, 4,
    5, 4, 0,
    0, 1, 5
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);;

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // array element buffer
    
    var iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);
    
    // color array atrribute buffer
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertexColors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    // vertex array attribute buffer
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
	
	

	modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix"); 
    thetaLoc = gl.getUniformLocation(program, "theta"); 
	type = gl.getUniformLocation(program,"type");
    
    //event listeners for buttons
    
    render();
	window.addEventListener("keydown", checkKeyPressed, false);
 
	function checkKeyPressed(e) {
		if (e.keyCode == "37") {
			//alert("The '<-' key is pressed.");
			if(horizontal>-0.8){
			horizontal = horizontal - 0.1;}
		}
		else if (e.keyCode == "38") {
			//alert("The '^' key is pressed.");
			
		}
		else if (e.keyCode == "39") {
			//alert("The '->' key is pressed.");
			if(horizontal<0.8){
			horizontal = horizontal + 0.1;}
		}
		else if (e.keyCode == "40") {
			//alert("The down arrow key is pressed.");
			alert(bulletMovement);
		}
		else if (e.keyCode == "32") {
			//alert("The down arrow key is pressed.");
			if (index == 0 && bulletMovement == 0)
			{
			index = index+1;
			bulletHorizontal = horizontal;
			var bBuffer = gl.createBuffer();
			gl.bindBuffer( gl.ARRAY_BUFFER, bBuffer );
			gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
	
			var bulletPosition = gl.getAttribLocation( program, "bulletPosition" );
			gl.vertexAttribPointer( bulletPosition, 3, gl.FLOAT, false, 0, 0 );
			gl.enableVertexAttribArray( bulletPosition );
			} 
			else if(bulletMovement > 2.0)
			{
				bulletMovement = 0;
				bulletHorizontal = horizontal;
			}
		}
	}
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	var ctm = mat4();
	ctm = mult(ctm, translate(vec3(-0.0+horizontal,-0.9,-0.5)));
	ctm = mult(ctm, scale(vec3(0.3, 0.1, 1.0)));
	gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
	gl.uniform1f( type,0.0);
    gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );
	
	if(index>0)
	{
		bulletMovement = bulletMovement + 0.01;
		ctm = mat4();
		ctm = mult(ctm, translate(vec3(-0.0+bulletHorizontal,-0.9+bulletMovement,-0.5)));
		ctm = mult(ctm, scale(vec3(0.03, 0.1, 1.0)));
		gl.uniformMatrix4fv(modelViewMatrix, false, flatten(ctm));
		gl.uniform1f( type,1.0);
		gl.drawElements( gl.TRIANGLES, numVertices, gl.UNSIGNED_BYTE, 0 );
	}

    requestAnimFrame( render );
}

