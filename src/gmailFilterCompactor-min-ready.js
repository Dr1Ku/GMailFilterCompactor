var j = document.createElement('script');j.setAttribute('type', 'text/javascript');j.setAttribute('src', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js');var h = document.getElementsByTagName('head')[0];h.appendChild(j);j.onreadystatechange = function(){ if (j.readyState == 'complete'){a();}};j.onload = function(){a();};
function a()
{
	var b =
	{  
		st:function(pl, pd)
		{
			this.si = 'iframe#canvas_frame';this.sf = 'span.qW';this.st = 512;this.am = 'Do this: ';
			this.dm = pd;this.ln = pl;this.la = 'Apply label "' + this.ln + '"';
			this.ma = [];this.mb = '';this.mc = {};
		},
		uc:function()
		{
			var i = this; var cf = i.mc; var ae = jQuery(cf.e); var ap = ae.parent(); var as = ap.html();
			cf.m = ae.html().replace(/<wbr>/gi, '');
			cf.a = as.substring(as.indexOf(i.am) + i.am.length, as.length);
			cf.c = ap.prev().children().first();
		},
		cl:function(s){ return s.replace('&lt;', '<').replace('&gt;', '>').replace('from:', '').replace('{(', '').replace(')}', ''); },
		rb:function() { var i = this; i.mb = i.cl(i.mb.substring(0, i.mb.length - 1)); i.ma.push('{'+i.mb+'}'); i.mb = ''; },
		cc:function()
		{
			var i = this; var r = new RegExp(i.la, 'i');
			if (i.mc.a.match(r))
			{
				if (i.mb.length > i.st) i.rb();
				i.mb += i.cl(i.mc.m) + '|';
				if (i.dm) i.mc.c.click();
			}	
		},
		ou: function()
		{
			var i = this; i.rb(); var h = (window && window.console);
			if (!h) alert('Here come the results, don\'t forget ' +'to Select (CTRL+A), Copy (CTRL+C) and Paste (CTRL+V) them ' +'within a text editor for instance !');
			jQuery.each(i.ma, function(id,e) { if (h) { console.log(e);console.log(' \n'); } else { alert(e); } } );	
			h ? alert('Done, check out the Firebug Console !') : alert('Those were the results, enjoy !');
		},
		df: function() { var i = this; if (i.dm) i.fb.find('button.qR').filter('[innerHTML=\'Delete\']').click(); },
		go: function()
		{
			var i = this; i.fb = jQuery(i.si).contents(); var fi = i.fb.find(i.sf);
			jQuery.each(fi, function(id,e) { i.mc.e = jQuery(e); i.uc();i.cc(); });
			i.ou();i.df();
		}
	};	
	
	var ln = prompt('What is the name of the Label we\'re looking for ? \n' +'For instance : \'Newsletter\' \n\n' +'Press Cancel to abort, no hard feelings.','Newsletter');
	if (ln != null && ln != '')
	{
		var wd = confirm('Would you like to delete the found fi afterwards ?\n' +'You can create new \'compacted\' fi using this script\'s output.\n\n' +'    NOTE: \'Cancel\' is \'No, do not delete filters\' ');
		b.st(ln, wd);b.go();
	}
}
h.removeChild(j);