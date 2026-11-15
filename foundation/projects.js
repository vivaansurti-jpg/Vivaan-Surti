// The projects shown in the Work gallery. Each one has its own page at
// projects/<slug>/ (copy an existing folder when adding a project).
// Image paths are from the site root, e.g. 'foundation/assets/projects/mochila.jpg';
// leave them empty to show the black placeholder.
//   image     the card shown in the Work gallery and as the project's main card
//   shots     extra images scattered around the project page (reuses `image` if empty)
//   links     buttons under the title (an empty href hides the button)
//   features  three blocks on the project page; story is the note near the end
window.PROJECTS=[
 {slug:'project-01',name:'JobScroll'},
 {slug:'project-02',name:'Amora'},
 {slug:'project-03',name:'Chapters & Co.',workImage:'foundation/assets/projects/chapters.webp',workBackground:'#fff7e8'},
 {slug:'project-04',name:'Obby',workImage:'foundation/assets/projects/obby.png',workBackground:'#d8d8d8'},
 {slug:'project-05',name:'psych',workImage:'foundation/assets/projects/psych.png',workBackground:'#f8f7fa'},
 {slug:'project-06',name:'Mochila',workImage:'foundation/assets/projects/mochila.png',workBackground:'#202127'},
 {slug:'project-07',name:'Helios'},
 {slug:'project-08',name:'Vector'},
 {slug:'project-09',name:'Alstroemeria'},
].map(p=>({
 tagline:'One line describing what this project does.',
 year:'2026',
 type:'Type',
 image:'',
 shots:[],
 links:[{label:'View on GitHub',href:'https://github.com/'},{label:'Visit project',href:'https://example.com/'}],
 features:[
  {bubble:'Feature one',title:'What it does first',text:'Two or three sentences describing this part of the project, what problem it solves, and how someone uses it.'},
  {bubble:'Feature two',title:'What it does next',text:'Two or three sentences describing this part of the project, what problem it solves, and how someone uses it.'},
  {bubble:'Feature three',title:'What makes it different',text:'Two or three sentences describing this part of the project, what problem it solves, and how someone uses it.'},
 ],
 story:[
  'A short paragraph on why this project exists: the problem you noticed and why it mattered to you.',
  'A paragraph on how you built it, including <mark>the decision you are proudest of</mark>.',
  'A closing line on what you learned, and what comes next.',
 ],
 ...p,
}));

// Links resolve from the site root, so they work from any page.
window.siteRoot=new URL('..',document.currentScript.src);
window.siteHref=path=>{
 const u=new URL(path,window.siteRoot);
 // Opened straight from the folder (file://), a folder link needs its index.html.
 if(location.protocol==='file:'&&u.pathname.endsWith('/'))u.pathname+='index.html';
 return u.href;
};
window.projectHref=slug=>window.siteHref('projects/'+slug+'/');
