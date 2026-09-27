import './overlay.css';
const root = document.querySelector('#crosshair');
let lastConfig;
function position(c=lastConfig) { if(!c)return;const dpr=window.devicePixelRatio||1;const physicalThickness=(Number(c.thickness)||1)*dpr;const snap=n=>(Math.round(n*dpr-physicalThickness/2)+physicalThickness/2)/dpr;root.style.left=`${snap(window.innerWidth/2+(Number(c.offsetX)||0))}px`;root.style.top=`${snap(window.innerHeight/2+(Number(c.offsetY)||0))}px`; }
window.addEventListener('resize',()=>position());
function render(c) {
  lastConfig=c;
  root.replaceChildren();
  root.style.display = c.visible ? 'block' : 'none';
  for (const [name, value] of Object.entries({color:c.color,alpha:Math.max(0,Math.min(100,Number(c.opacity)||0))/100,size:`${c.size}px`,length:`${c.length}px`,thickness:`${c.thickness}px`,gap:`${c.gap}px`,'offset-x':`${c.offsetX||0}px`,'offset-y':`${c.offsetY||0}px`})) root.style.setProperty(`--${name}`, value);
  root.className = `crosshair shape-${c.shape} ${c.outline ? 'outlined' : ''}`;
  const add = (className) => { const el = document.createElement('i'); el.className = className; root.append(el); };
  if (c.shape === 'dot') add('center-dot');
  else if (c.shape === 'circle') { add('ring'); if (c.dot) add('center-dot'); }
  else if (c.shape === 'cross') { add('diagonal d1'); add('diagonal d2'); if (c.dot) add('center-dot'); }
  else { for (const side of ['top','right','bottom','left']) add(`arm a-${side}`); if (c.dot) add('center-dot'); }
  position(c);
}
if (window.aimxity) { window.aimxity.get().then(data => render(data.config || data)); window.aimxity.onConfig(render); }
else render({visible:true,shape:'classic',color:'#b8ff42',size:30,length:30,thickness:3,gap:7,offsetX:0,offsetY:0,opacity:100,dot:false,outline:true});
