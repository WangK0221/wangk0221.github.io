(function () {
  var bar = document.querySelector(".topbar");
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  var sections = links
    .map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    })
    .filter(Boolean);

  function spy() {
    var marker = Math.min(180, window.innerHeight * 0.33);
    var current = null;
    var nearBottom = window.scrollY > 80 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    if (nearBottom && sections.length) {
      current = sections[sections.length - 1];
    } else {
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= marker) current = section;
      });
    }
    links.forEach(function (link) {
      var on = current && link.getAttribute("href") === "#" + current.id;
      if (on) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    if (bar) bar.classList.toggle("is-scrolled", window.scrollY > 4);
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        spy();
        ticking = false;
      });
    },
    { passive: true }
  );
  spy();

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy]"), function (btn) {
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      var value = btn.getAttribute("data-copy");
      var finish = function (ok) {
        btn.textContent = ok ? "已复制" : "请手动复制";
        window.setTimeout(function () {
          btn.textContent = label;
        }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { finish(true); }).catch(function () {
          try {
            fallback(value);
            finish(true);
          } catch (error) {
            finish(false);
          }
        });
      } else {
        try {
          fallback(value);
          finish(true);
        } catch (error) {
          finish(false);
        }
      }
    });
  });

  function fallback(value) {
    var input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-999px";
    document.body.appendChild(input);
    input.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (error) {
      ok = false;
    }
    document.body.removeChild(input);
    if (!ok) throw new Error("copy failed");
  }
})();
