$(document).ready(function(){
	draw();
});

function drawFractal(paramx,paramy,param1,param2){
	var x,y,i,xt;
    var cx,cy;
    var color;
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    
    paramx = -1 * parseFloat(paramx);
    paramy = -1 * parseFloat(paramy);
    param1 = parseFloat(param1);
    param2 = parseFloat(param2);

    for(x=0;x<150;x++){
        for(y=0;y<150;y++){
            i=0;
            cx=paramx+x/param1;
            cy=paramy+y/param2;
            zx=0;
            zy=0;                        

            do{
            	xt=zx*zy;
                zx=zx*zx-zy*zy+cx;
                zy=2*xt+cy;
                i++;
            }while(i<255&&(zx*zx+zy*zy)<2);

            color=i.toString(16);
            context.beginPath();
            context.rect(x*2, y*2, 2, 2);
            context.fillStyle ='#'+color+color+color;
            context.fill();
        }
    }
}

function draw(){
	var paramx = document.getElementById("paramx").value;
	var paramy = document.getElementById("paramy").value;
	var param1 = document.getElementById("param1").value;
	var param2 = document.getElementById("param2").value;

	document.getElementById("txtParamx").value = paramx;
	document.getElementById("txtParamy").value = paramy;
	document.getElementById("txtParam1").value = param1;
	document.getElementById("txtParam2").value = param2;

	drawFractal(paramx,paramy,param1,param2);
}