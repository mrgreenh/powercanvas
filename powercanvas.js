function PowerCanvas(canvas_id){
    var self = this;
    var selectedImage = null;
    var wasTransforming = false; //set during transforming for preventing object unselection
    var tmpZIndex = 0; //For remembering which was an object's ZIndex before selection
    //Configuration
    var initialSize = 3;

    //Handles declaration
    var translationHandle;
    var rotationHandle;

    //For debugging
    //var field1 = document.querySelector("#field1");
    //var field2 = document.querySelector("#field2");

    self.workspace = oCanvas.create({
	canvas: "#"+canvas_id
    });
    //------------------------------------------------Handles
    translationHandle = self.workspace.display.image({
	x: 0,
	y: 0,
	width:40,
	height:40,
	origin: { x: "center", y: "center" },
	image: "images/traslationHandle.png"
    })
    
    rotationHandle = self.workspace.display.image({
	x: 0,
	y: 0,
	width:20,
	height:20,
	rotation:-90,
	origin: { x: "center", y: "center" },
	image: "images/rotationHandle.png"
    });
    
    scalingHandle = self.workspace.display.image({
	x: 0,
	y: 0,
	width:20,
	height:20,
	origin: { x: "center", y: "center" },
	image: "images/scalingHandle.png"
    });
    
    shadingHandle = self.workspace.display.image({
	x: 0,
	y: 0,
	width:40,
	height:40,
	origin: { x: "center", y: "center" },
	image: "images/shadingHandle.png"
    });
    
    
    self.workspace.bind("click",function(event){//Unselect object if clicking on empty region
	event.stopPropagation();
	if(selectedImage!=null&&!wasTransforming) self.unselect(selectedImage);
	wasTransforming = false;
    });
    //image type definition
    self.workspace.display.register(
	"userImage", {
	    shapeType: "rectangular"
	},function (ctx) {
	    this.width = this.image.width;
	    this.height = this.image.height;
	    this.setOrigin("center","center");
	    
	    //Drawing border
	    ctx.beginPath();
	    
	    if (this.strokeWidth > 0) {
		ctx.strokeStyle = this.strokeColor;
		ctx.lineWidth = this.strokeWidth*2;
		ctx.strokeRect(0-this.width/2, 0-this.height/2, this.width, this.height);
	    }
	    ctx.closePath();
	    
	    //Image drawing and effects applying
	    //abs_x and abs_y are position coordinates (in this case at center of image)
	    //getOrigin.x and .y are origin offset from top-left corner
	    ctx.drawImage(this.image,0-this.width/2,0-this.height/2,this.width,this.height);
	    //ADDING a comment
	});

    //------------------------------------------------------------Inserting
    //Function for creating image and handles in oCanvas
    this.insertImage = function(file,x,y,callback){
	var image = new Image();
	image.onload = function(){
	    //Image resizing so that it fits inside the canvas
	    if(image.width>(self.workspace.width/initialSize)||image.height>(self.workspace.height/initialSize)) {
		var ratio = image.height/image.width;
		if (image.width == Math.max(image.height,image.width)){ //width is biggest size
		    image.width = self.workspace.width/initialSize;
		    image.height = image.width*ratio;
		}else { //Height is biggest size
		    image.height = self.workspace.height/initialSize;
		    image.width = image.height/ratio;
		}
	    }
	    
	    //Create image and handles' container object (the one that is moved and rotated)
	    var imageContainer = self.workspace.display.rectangle({
		x:x,
		y:y,
		height:image.height,
		width:image.width,
		stroke:"0px #000000"
	    });
	    imageContainer.setOrigin("center","center");
	    
	    //Create oCanvas userImage object
	    canvasImage = self.workspace.display.userImage({
		x: 0,
		y: 0,
		image: image
	    });
	    
	    //Combine everything together: image and handles inside the container
	    imageContainer.addChild(canvasImage);
	    //Variables INITIALIZATION
	    imageContainer.shadowX = -10;
	    imageContainer.shadowY = -10;
	    imageContainer.selected = false;
	    imageContainer.bind("click",function(event){
		event.stopPropagation();
		self.select(this);
	    });
	    
	    self.workspace.addChild(imageContainer);
	    self.select(imageContainer);
	    self.bringFront();
	    self.workspace.redraw();
	    if(callback!=undefined) callback();
	};
	image.src = file;
	
    }


    //Caption fields
    this.addCaption = function(content,color,font,callback){
	if(content.length>0){
	    var text = self.workspace.display.text({
		x: 0,
		y: 0,
		origin: { x: "center", y: "center" },
		font: font,
		text: content,
		fill: color
	    });
	    
	    var imageContainer = self.workspace.display.rectangle({
		x:$("canvas").width()/2,
		y:$("canvas").height()/2,
		height:text.height,
		width:text.width,
		stroke:"0px #000000"
	    });
	    imageContainer.setOrigin("center","center");
	    imageContainer.shadowX = -10;
	    imageContainer.shadowY = -10;
	    imageContainer.selected = false;
	    imageContainer.bind("click",function(event){
		event.stopPropagation();
		self.select(this);
	    });
	    
	    imageContainer.addChild(text);
	    self.workspace.addChild(imageContainer);
	    imageContainer.children[0].shadow = "0 0 0 transparent";
	    self.select(imageContainer);
	    self.bringFront();
	    self.workspace.redraw();
	    $("#captionField").val("");
	    
	}
	if(callback!=undefined) callback();
    }
   
    //------------------------------------------------------FX and object managing
    //Image selection and deletion functions
    this.select = function(imageContainer){
	if(!imageContainer.selected){
	    if(selectedImage!=null) self.unselect(selectedImage);
	    imageContainer.selected = true;
	    imageContainer.stroke = (10+imageContainer.children[0].strokeWidth*2)+"px #8ff";
	    selectedImage = imageContainer;
	    tmpZIndex = selectedImage.zIndex;
	    selectedImage.zIndex = "front";
	    self.workspace.redraw();
	    self.move();
	}
    }
    
    this.unselect = function(imageContainer){
	imageContainer.selected = false;
	imageContainer.stroke = "0px transparent"
	//All editings have to be interrupted here
	self.stopEditings();
	selectedImage.zIndex = tmpZIndex;
	selectedImage = null;
	self.workspace.redraw();
    }

    this.erase = function(){
	self.workspace.removeChild(selectedImage);
    }
    
    //Z-index functions
    this.sendBack = function(){
	selectedImage.zIndex = "back";
	tmpZIndex = selectedImage.zIndex;//For preventing the object to be restored to its previous index when unselected
	self.workspace.redraw();
    }

    this.bringFront = function(){
	selectedImage.zIndex = "front";
	tmpZIndex = selectedImage.zIndex;//For preventing the object to be restored to its previous index when unselected
	self.workspace.redraw();
    }

    //Selected object borders
    this.setBorders = function(width,color){	
	selectedImage.children[0].stroke = (width*2)+"px "+color;
	selectedImage.stroke = (10+selectedImage.children[0].strokeWidth*2)+"px #8ff";
	self.workspace.redraw();
    }

    //Selected object translation
    this.move = function(){
	this.stopEditings();
	selectedImage.dragAndDrop(true);
	selectedImage.addChild(translationHandle);
	self.workspace.redraw();
    }

    //Selected object Rotation
    this.rotate = function(){
	self.stopEditings();
	selectedImage.addChild(rotationHandle);
	rotationHandle.x = selectedImage.width/2+5;
	rotationHandle.y = 0-selectedImage.height/2-5;
	var handleOffset = rotationHandle.x/(Math.sqrt(Math.pow(rotationHandle.x,2)+Math.pow(rotationHandle.y,2)));
	handleOffset = Math.acos(handleOffset)*180/Math.PI;
	rotationHandle.unbind("mousedown").bind("mousedown",function(event){
	    var startX, startY;
	    self.workspace.bind("mousemove",function(){
		wasTransforming = true;
		startX = self.workspace.mouse.x-selectedImage.abs_x;
		startY = self.workspace.mouse.y-selectedImage.abs_y;
		theta = Math.atan2(startY,startX)*180/Math.PI;
		selectedImage.rotateTo(theta+handleOffset);
		self.workspace.redraw();
	    });
	    self.workspace.bind("mouseup",function(){
		self.workspace.unbind("mousemove mouseup");
	    });
	});
	self.workspace.redraw();
    }

    //Selected object scaling
    this.scale = function(){

	var testline;//To delete
	// testLineX = self.workspace.display.line({
	// start: { x:0,y:0},
	//  end: { x:0,y:0 },
	//  stroke: "20px #f00",
	//  cap: "round",
	//  });
	// testLineY = self.workspace.display.line({
	// start: { x:0,y:0},
	//  end: { x:0,y:0 },
	//  stroke: "20px #00f",
	//  cap: "round"
	//  });
	
	self.stopEditings();
	selectedImage.addChild(scalingHandle);
	function placeHandle(){
	    scalingHandle.x = selectedImage.width/2+5;
	    scalingHandle.y = selectedImage.height/2+5;
	}
	placeHandle();
	var counter = 0;
	scalingHandle.unbind("mousedown").bind("mousedown",function(event){
	    event.stopPropagation();
	    var startX, startY, nowX, nowY, cornerX, cornerY, scaleX=1, scaleY=1;
	    cornerX = selectedImage.abs_x-rotatePointer(selectedImage.getOrigin().x,selectedImage.getOrigin().y)[0];
	    cornerY = selectedImage.abs_y-rotatePointer(selectedImage.getOrigin().x,selectedImage.getOrigin().y)[1];
	    startX = self.workspace.mouse.x-cornerX;
	    startY = self.workspace.mouse.y-cornerY;
	    nowX = startX, nowY = startY;
	    wasTransforming = true;
	    
	    //self.workspace.addChild(testLineX);
	    //self.workspace.addChild(testLineY);
	    self.workspace.redraw();
	    //field1.value = "cornerX: "+cornerX.toFixed(2)+" cornerY: "+cornerY.toFixed(2);
	    self.workspace.bind("mousemove",function(event){
		event.stopPropagation();
		nowX = self.workspace.mouse.x-cornerX;
		nowY = self.workspace.mouse.y-cornerY;
		// 
		// testLineX.start =  { x:200,y:200}, testLineX.end =  { x:200-(nowX/startX)*100,y:200 };
		// testLineY.start =  { x:200,y:200}, testLineY.end =  { x:200,y:200-(nowY/startY)*100 };
		// 
		scaleX = Math.sqrt(Math.pow(nowX,2)+Math.pow(nowY,2))/Math.sqrt(Math.pow(startX,2)+Math.pow(startY,2));
		scaleY = Math.sqrt(Math.pow(nowX,2)+Math.pow(nowY,2))/Math.sqrt(Math.pow(startX,2)+Math.pow(startY,2));
		//field2.value = "nowX/startX: "+nowX.toFixed(2)+"/"+startX.toFixed(2)+" nowY/startY: "+nowY.toFixed(2)+"/"+startY.toFixed(2)+" ScaleX:"+scaleX.toFixed(2)+" ScaleY:"+scaleY.toFixed(2);
		if(counter==5) {
		    selectedImage.scale(Math.abs(scaleX),Math.abs(scaleY));
		    self.workspace.redraw();
		    counter = 0;
		}
		counter++;
	    });
	    
	    self.workspace.bind("mouseup",function(event){
		event.stopPropagation();
		if(selectedImage.children[0].type!="text"){
		    selectedImage.scale(1,1);
		    selectedImage.children[0].image.width = selectedImage.children[0].image.width*Math.abs(scaleX);
		    selectedImage.children[0].image.height = selectedImage.children[0].image.height*Math.abs(scaleY);
		    selectedImage.width = selectedImage.children[0].image.width;
		    selectedImage.height = selectedImage.children[0].image.height;
		    placeHandle();
		}else{
		    selectedImage.children[1].remove();
		    selectedImage.scale(1,1);
		    selectedImage.children[0].size = selectedImage.children[0].size*Math.abs(scaleX);
		    selectedImage.height = selectedImage.height*Math.abs(scaleX);
		    selectedImage.width = selectedImage.width*Math.abs(scaleY);
		    selectedImage.addChild(scalingHandle);
		    placeHandle();
		}
		self.workspace.unbind("mousemove mouseup");
		self.workspace.redraw();
	    });
	});
	self.workspace.redraw();
    }

    this.restoreImageScaling = function(){
	selectedImage.children[0].image.width = selectedImage.width;
	selectedImage.children[0].image.height = selectedImage.height;
	self.workspace.redraw();
    }


    //Selected object shading
    this.shade = function(){
	self.stopEditings();
	var nowX=0, nowY=0;
	selectedImage.addChild(shadingHandle);
	shadingHandle.x = selectedImage.shadowX;
	shadingHandle.y = selectedImage.shadowY;
	function setShadow(){
	    nowX = shadingHandle.x;
	    nowY = shadingHandle.y;
	    selectedImage.children[0].shadowColor = "#000";
	    selectedImage.children[0].shadowOffsetX = rotatePointer(Math.min(Math.abs(nowX),50)*sign(-nowX),Math.min(Math.abs(nowY),50)*sign(-nowY))[0];
	    selectedImage.children[0].shadowOffsetY = rotatePointer(Math.min(Math.abs(nowX),50)*sign(-nowX),Math.min(Math.abs(nowY),50)*sign(-nowY))[1];
	    selectedImage.children[0].shadowBlur = Math.sqrt(Math.pow(nowX,2)+Math.pow(nowY,2))+10;
	    selectedImage.shadowX = nowX;
	    selectedImage.shadowY = nowY;
	}
	setShadow();
	self.workspace.redraw();
	shadingHandle.dragAndDrop({
	    move:function(){
		setShadow();
		//field1.value = selectedImage.children[0].shadowOffsetX;
	    },
	});
    }

    //Stop editings on selected object
    this.stopEditings = function(){
	if(selectedImage!=null){
	    if(selectedImage.children.indexOf(translationHandle)>-1){ //Stop translation
		selectedImage.removeChild(translationHandle);
		selectedImage.dragAndDrop(false);
	    }
	    if(selectedImage.children.indexOf(rotationHandle)>-1){ //Stop translation
		selectedImage.removeChild(rotationHandle);
	    }
	    if(selectedImage.children.indexOf(scalingHandle)>-1){ //Stop scaling
		selectedImage.removeChild(scalingHandle);
	    }
	    if(selectedImage.children.indexOf(shadingHandle)>-1){
		selectedImage.removeChild(shadingHandle);
		shadingHandle.dragAndDrop(false);
		shadingHandle.x = 0,shadingHandle.y = 0;
	    }
	}
    }


    //Utilities
    function sign(number){
	if(number>=0) return 1;
	else return -1;
    }

    function rotatePointer(x,y,sign){
	tranX = x;
	tranY = y;
	if (sign==undefined) sign = 1;
	angle = selectedImage.rotation/180*Math.PI;
	newX = tranX*Math.cos(angle)-tranY*Math.sin(angle);
	newY = tranX*Math.sin(angle)+tranY*Math.cos(angle);
	return [newX,newY];
    }

}

