/*
 	 Copyright (c) 2007, iUI Project Members
	 See LICENSE.txt for licensing terms
	 
	 Modified for iPeng 2008, Joerg Schwieder
 */


(function() {

var slideSpeed = 12;
var slideInterval = 1;
var bottombarTop = (bottombarTop) ? bottombarTop : 369;
var topbarHeight = (topbarHeight) ? topbarHeight : -4;
var docParent = null;
var docStack = null;

var currentPage = null;
var currentDialog = null;
var currentWidth = 0;
var currentTitles = "1";
var currentHash = location.hash;
var hashPrefix = "#_";
var pageHistory = [];
var newPageCount = 0;
var checkTimer;

// *************************************************************************************************

window.iui =
{
    showPage: function(page, backwards)
    {
        if (page)
        {
        	HomeScreenStack.addConditional(page);
            if (currentDialog)
            {
                currentDialog.removeAttribute("selected");
                currentDialog = null;
            }

            if (page.hasClassName("dialog"))
                showDialog(page);
            else
            {
                var fromPage = currentPage;
                currentPage = page;

                if (fromPage)
                    setTimeout(slidePages, 0, fromPage, page, backwards);
                else
                    updatePage(page, fromPage);
            }
        }
    },

    showPageById: function(pageId)
    {
        var page = $(pageId);
        if (page)
        {
            var index = pageHistory.indexOf(pageId);
            var backwards = index != -1;
            if (backwards)
                pageHistory.splice(index, pageHistory.length);

            iui.showPage(page, backwards);
        }
    },

    showPageByHref: function(href, args, method, replace, cb, delay)
    {
    	if (args)
    		args.push('player=' + player);
    	else
    		args = [ 'player=' + player ];
    	args.push('iPengUpdate=1');
		var req = new XMLHttpRequest();
        req.onerror = function()
        {
            if (cb)
                cb(false);
        };
        
        req.onreadystatechange = function()
        {
            if (req.readyState == 4)
            {
                if (replace) {
                    replaceElementWithSource(replace, req.responseText);
	            	req.responseText.evalScripts();
                }
                else
                {
                    var frag = document.createElement("div");
                    frag.innerHTML = req.responseText;
                    iui.insertPages(frag.childNodes);
	            	req.responseText.evalScripts();
                }
                if (cb)
                    setTimeout(cb, (delay) ? delay : 2000, true);
            }
        };

        if (args)
        {
            req.open(method || "GET", href + "&" + args.join("&"), true);
//            req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
//            req.setRequestHeader("Content-Length", args.length);
//            req.send(args.join("&"));
            req.send(null);
//console.log('pbHref:' + href);
//console.log("args:" + args.join("&"));
        }
        else
        {
            req.open(method || "GET", href, true);
            req.send(null);
        }
    },
    
    insertPages: function(nodes)
    {
        var targetPage;
        for (var i = 0; i < nodes.length; ++i)
        {
            var child = nodes[i];
            if (child.nodeType == 1)
            {
                if (!child.id)
                    child.id = "__" + (++newPageCount) + "__";

                var clone = $(child.id);
                if (clone)
                    clone.parentNode.replaceChild(child, clone);
                else
                    docParent.appendChild(child);
//                    document.body.appendChild(child);

                if (child.getAttribute("selected") == "true" || !targetPage)
                    targetPage = child;
                
                --i;
            }
        }

        if (targetPage)
            iui.showPage(targetPage);    
    },

    getSelectedPage: function()
    {
        for (var child = docParent.firstChild; child; child = child.nextSibling)
        {
            if (child.nodeType == 1 && child.getAttribute("selected") == "true")
                return child;
        }    
    }    
};

// *************************************************************************************************

addEventListener("load", function(event)
{
//    var page = iui.getSelectedPage();
	docParent = $('HomeScreen');
	var page = $('HomeMain');
    if (page)
        iui.showPage(page);

    setTimeout(preloadImages, 0);
//    setTimeout(checkOrientAndLocation, 0);
//    checkTimer = setInterval(checkOrientAndLocation, 300);
    
	docParent.addEventListener("click", function(event)
	{
//console.log("IUI link finder:" + event.target.id);
		var link = findParent(event.target, "a");
		if (link)
		{
//console.log("IUI link:" + link.hash + ".url:" + link.href);
			function unselect() { link.removeAttribute("selected"); }
			if (link.target.substr(0, 12) == "_javascript:") {
				eval(link.target.substr(12));
				link.target = null;
			}
			if (link.href && link.hash && link.hash != "#")
			{
				link.setAttribute("selected", "true");
				iui.showPage($(link.hash.substr(1)));
				setTimeout(unselect, 500);
			}
			else if (link.id.substr(0, 10) == "backButton")
				history.back();
			else if (link.getAttribute("type") == "submit")
				submitForm(findParent(link, "form"));
			else if (link.getAttribute("type") == "cancel")
				cancelDialog(findParent(link, "form"));
			else if (link.target == "_replace") {
					link.setAttribute("selected", "progress");
					iui.showPageByHref(link.href, null, null, link, unselect);
			} else if (link.target == "_none") { }
			else if (link.target == "_iPeng") {
				var addparm = "&player=" + player;
				if (link.href.indexOf("?") == -1)
					addparm = "?" + addparm;
//console.log("iPengHREF:" + link.href + ".AP:" + addparm + ".link.hash:" + link.hash);
				if (link.href.indexOf("#") != -1)
					document.location = link.href.substr(0, link.href.indexOf("#")) + 
																	addparm + link.hash;
				else
					document.location = link.href + addparm;
			}
			else if (link.target.substr(0, 8) == "_onload:") { 
					link.setAttribute("selected", "progress");
					iui.showPageByHref(link.href, null, null, null, link.target.substr(8), 1);
					unselect();
			} else if (!link.target) {
					link.setAttribute("selected", "progress");
					iui.showPageByHref(link.href, null, null, null, unselect);
			} else
//			return;
				document.location = link.href;// + "&player=" + player;
			event.preventDefault();        
		}
	}, true);
	
	docParent.addEventListener("click", function(event)
	{
		var div = findParent(event.target, "div");
		if (div && div.hasClassName("toggle"))
		{
			div.setAttribute("toggled", div.getAttribute("toggled") != "true");
			event.preventDefault();        
		}
	}, true);

}, false);

function checkOrientAndLocation()
{
    if (window.innerWidth != currentWidth)
    {   
        currentWidth = window.innerWidth;
        var orient = currentWidth == 320 ? "profile" : "landscape";
        document.body.setAttribute("orient", orient);
        setTimeout(scrollTo, 100, 0, 1);
    }

    if (location.hash != currentHash)
    {
        var pageId = location.hash.substr(hashPrefix.length)
        iui.showPageById(pageId);
    }
}

function showDialog(page)
{
    currentDialog = page;
    page.setAttribute("selected", "true");
    
    if (page.hasClassName("dialog") && !page.target)
        showForm(page);
}

function showForm(form)
{
    form.onsubmit = function(event)
    {
        event.preventDefault();
        submitForm(form);
    };
    
    form.onclick = function(event)
    {
        if (event.target == form && form.hasClassName("dialog"))
            cancelDialog(form);
    };
}

function cancelDialog(form)
{
    form.removeAttribute("selected");
}

function updatePage(page, fromPage, backwards)
{
    if (!page.id)
        page.id = "__" + (++newPageCount) + "__";

    location.href = currentHash = hashPrefix + page.id;
        
    pageHistory.push(page.id);

    if (page.localName.toLowerCase() == "form" && !page.target)
        showForm(page);
        
    var backButton = $("backButton" + ((currentTitles == "1") ? "2" : "1"));
    var cbackButton = $("backButton" + currentTitles);
    if (backButton) {
        var prevPage = $(pageHistory[pageHistory.length-2]);
		backButton.style.webkitTransitionProperty = "-webkit-transform, opacity";
        if (prevPage && !page.getAttribute("hideBackButton"))
            backButton.innerHTML = prevPage.title ? prevPage.title : "Back";
        else
            backButton.style.display = "none";
		backButton.style.webkitTransform = "translateX(0px)";
		backButton.style.opacity = 1;
    }
	if (cbackButton) {
		cbackButton.style.webkitTransitionProperty = "-webkit-transform, opacity";
		if (backwards)
			cbackButton.style.webkitTransform = "translateX(320px)";
		cbackButton.style.opacity = 0;
	}

	var pageTitle = $("pageTitle" + ((currentTitles == "1") ? "2" : "1"));
    var cpageTitle = $("pageTitle" + currentTitles);
	if (page.title && pageTitle) {
		pageTitle.style.webkitTransitionProperty = "-webkit-transform, opacity";
		if (page.title.length > 15)
			pageTitle.setStyle({ fontSize : '80%', paddingTop : '3' });
		else
			pageTitle.setStyle({ fontSize : '100%', paddingTop : '0' });
		if (backButton)
			pageTitle.style.width = 231 - min(max(backButton.scrollWidth, 35), 60);
        pageTitle.textContent = page.title;
		pageTitle.style.webkitTransform = "translateX(0px)";
		pageTitle.style.opacity = 1;
    }
    if (cpageTitle) {
		cpageTitle.style.webkitTransitionProperty = "-webkit-transform, opacity";
		if (backwards)
			cpageTitle.style.webkitTransform = "translateX(320px)";	
		cpageTitle.style.opacity = 0;
    }

    currentTitles = (currentTitles == "1") ? "2" : "1";
}

function slidePages(fromPage, toPage, backwards)
{
console.log("slidePages:" + fromPage.id + ".:." + toPage.id + ".:." + backwards);
    var Yexp = /translateY\([0-9.-]+px\)/;
    var toOffset = Yexp.exec(toPage.style.webkitTransform);
    toOffset = toOffset ? toOffset[0] : "";
    var axis = (backwards ? fromPage : toPage).getAttribute("axis");

    toPage.style.webkitTransitionDuration = "0s";
	if (axis != "y")
        toPage.style.webkitTransform = 
        		"translateX(" + (backwards ? '-320px' : '320px') + ") " + toOffset;
	var toPageTitle = $("pageTitle" + ((currentTitles == "1") ? "2" : "1"));
	if (toPageTitle) {
		toPageTitle.style.webkitTransitionProperty = "none";
		toPageTitle.style.webkitTransform = (backwards) ? "translateX(0px)" : "translateX(320px)";
	}	
    var backButton = $("backButton" + ((currentTitles == "1") ? "2" : "1"));
    if (backButton) {
        var prevPage = $(pageHistory[pageHistory.length-1]);
		backButton.style.webkitTransitionProperty = "none";
        if (prevPage && !toPage.getAttribute("hideBackButton"))
            backButton.style.display = "inline";
		backButton.style.webkitTransform = (backwards) ? "translateX(0px)" : "translateX(320px)";
    }

    var fromOffset = Yexp.exec(fromPage.style.webkitTransform);
    fromOffset = fromOffset ? fromOffset[0] : "";
    
    fromPage.style.webkitTransitionDuration = "0s";
	if (axis == "y")
        (backwards ? fromPage : toPage).style.webkitTransform = "translateY(100%)";


    setTimeout(pushIn, 0, fromPage, toPage, backwards, fromOffset, toOffset, axis);
}
    
function pushIn(fromPage, toPage, backwards, fromOffset, toOffset, axis) {
    scrollTo(0, 1);
    clearInterval(checkTimer);
    
    toPage.setAttribute("selected", "true");
    fromPage.style.webkitTransitionDuration = "0.5s";
    toPage.style.webkitTransitionDuration = "0.5s";

    if (axis == "y")
		(backwards ? fromPage : toPage).style.webkitTransition = "translateY(0%)";
    else {
        fromPage.style.webkitTransform = 
        		"translateX(" + (backwards ? '320px' : '-320px') + ") " + fromOffset;
        toPage.style.webkitTransform = "translateX(0px) " + toOffset;
    }
//	if (!toPage.hasClassName("dialog"))
//		fromPage.removeAttribute("selected");

	checkTimer = setInterval(checkOrientAndLocation, 300);
	updatePage(toPage, fromPage, backwards);
//	setTimeout(updatePage, 0, toPage, fromPage);
}

function preloadImages()
{
    var preloader = document.createElement("div");
    preloader.id = "preloader";
    document.body.appendChild(preloader);
}

function submitForm(form)
{
    iui.showPageByHref(form.action || "POST", encodeForm(form), form.method);
}

function encodeForm(form)
{
    function encode(inputs)
    {
        for (var i = 0; i < inputs.length; ++i)
        {
            if (inputs[i].name)
                args.push(inputs[i].name + "=" + escape(inputs[i].value));
        }
    }

    var args = [];
    encode(form.getElementsByTagName("input"));
    encode(form.getElementsByTagName("select"));
    return args;    
}

function findParent(node, localName)
{
    while (node && (node.nodeType != 1 || node.localName.toLowerCase() != localName))
        node = node.parentNode;
    return node;
}

function replaceElementWithSource(replace, source)
{
    var page = replace.parentNode;
    var parent = replace;
    while (page.parentNode != docParent)
    {
        page = page.parentNode;
        parent = parent.parentNode;
    }

    var frag = document.createElement(parent.localName);
    frag.innerHTML = source;

    page.removeChild(parent);

    while (frag.firstChild)
        page.appendChild(frag.firstChild);
}

})();
