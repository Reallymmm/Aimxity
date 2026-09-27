import './overlay.css';
const root = document.querySelector('#crosshair');
function render(c) {
  root.replaceChildren(); root.style.display = c.visible ? 'block' : 'none';
  root.style.setProperty('--color', c.color); root.style.setProperty('--alpha', c.opacity / 100); root.style.setProperty('--size', `${c.size}px`); root.style.setProperty('--thickness', `${c.thickness}px`); root.style.setProperty('--gap', `${c.gap}px`);
  root.className = `crosshair shape-${c.shape} ${c.outline ? 'outlined' : ''}`;
  if (c.shape === 'dot') { const d = document.createElement('i'); d.className = 'dot'; root.append(d); }
  else if (c.shape === 'circle') { const d = document.createElement('i'); d.className = 'ring'; root.append(d); if(c.dot){const dot=document.createElement('i');dot.className='dot';root.append(dot)} }
  else { for(const side of ['top','right','bottom','left']) { const el=document.createElement('i');el.className=`arm ${side}`;root.append(el); } if(c.dot){const d=document.createElement('i');d.className='dot';root.append(d)} }
}
if (window.aimxity) { window.aimxity.get().then(render); window.aimxity.onConfig(render); }
else render({visible:true,shape:'classic',color:'#b8ff42',size:30,thickness:3,gap:7,opacity:100,dot:false,outline:true});
