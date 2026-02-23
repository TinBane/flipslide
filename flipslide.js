(function () {
  'use strict';

  // ── Yaml ──
  var Yaml = {
    parse: function (text) {
      var lines = text.split('\n'), root = {}, stack = [{ indent: -1, obj: root }];
      for (var i = 0; i < lines.length; i++) {
        var raw = lines[i], trimmed = raw.replace(/\s+$/, '');
        if (trimmed === '' || trimmed.charAt(0) === '#') continue;
        var indent = raw.search(/\S/), content = trimmed.slice(indent);
        var colonIdx = content.indexOf(':');
        if (colonIdx === -1) continue;
        var key = content.slice(0, colonIdx).trim();
        var val = content.slice(colonIdx + 1).trim();
        if (val && val.charAt(0) !== '"' && val.charAt(0) !== "'") {
          var ci = val.indexOf(' #');
          if (ci > -1) val = val.slice(0, ci).trim();
        }
        while (stack.length > 1 && stack[stack.length - 1].indent >= indent) stack.pop();
        var parent = stack[stack.length - 1].obj;
        if (val === '') { var child = {}; parent[key] = child; stack.push({ indent: indent, obj: child }); }
        else parent[key] = Yaml._cast(val);
      }
      return root;
    },
    _cast: function (v) {
      if ((v.charAt(0) === '"' && v.charAt(v.length - 1) === '"') ||
          (v.charAt(0) === "'" && v.charAt(v.length - 1) === "'")) return v.slice(1, -1);
      if (v.charAt(0) === '[' && v.charAt(v.length - 1) === ']')
        return v.slice(1, -1).split(',').map(function (s) { return Yaml._cast(s.trim()); });
      if (v === 'true') return true;
      if (v === 'false') return false;
      if (/^-?\d+(\.\d+)?$/.test(v)) return parseFloat(v);
      return v;
    }
  };

  // ── Config ──
  var Config = {
    extract: function (md) {
      var idx = md.indexOf('<!-- flipslide:config');
      if (idx === -1) return { content: md, config: {} };
      var content = md.slice(0, idx).trim();
      var block = md.slice(idx + 21);
      var end = block.lastIndexOf('-->');
      if (end > -1) block = block.slice(0, end);
      try {
        return { content: content, config: Yaml.parse(block) };
      } catch (e) {
        console.error('Flipslide: failed to parse config YAML block –', e);
        var overlay = document.createElement('div');
        overlay.setAttribute('style', 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px)');
        overlay.innerHTML = '<div style="background:#1a1a2e;border:2px solid #f87171;border-radius:1vw;padding:3vw;max-width:60vw;font-family:sans-serif;color:#e0e0e0">' +
          '<h2 style="margin:0 0 1vw;font-size:2.4vw;color:#f87171">Config Error</h2>' +
          '<p style="font-size:1.4vw;margin:0 0 1.5vw">The YAML configuration block could not be parsed.</p>' +
          '<pre style="background:#0d0d1a;padding:1.5vw;border-radius:0.5vw;font-size:1.1vw;overflow-x:auto;color:#fca5a5;white-space:pre-wrap">' + esc(String(e)) + '</pre>' +
          '<button onclick="this.parentNode.parentNode.remove()" style="margin-top:1.5vw;padding:0.6vw 2vw;border:none;border-radius:0.4vw;background:#f87171;color:#fff;font-size:1.2vw;cursor:pointer">Dismiss</button>' +
          '</div>';
        document.body.appendChild(overlay);
        return { content: content, config: {} };
      }
    },
    applyTheme: function (config) {
      var t = config.theme || {}, r = document.documentElement;
      var m = { background:'--dm-bg', text:'--dm-text', accent:'--dm-accent',
        heading_font:'--dm-heading-font', body_font:'--dm-body-font',
        slide_padding:'--dm-slide-padding', title_size:'--dm-title-size',
        heading_size:'--dm-heading-size', body_size:'--dm-body-size',
        table_size:'--dm-table-size', split_gap:'--dm-split-gap',
        callout_bg:'--dm-callout-bg', callout_text:'--dm-callout-text',
        callout_size:'--dm-callout-size', callout_padding:'--dm-callout-padding',
        callout_radius:'--dm-callout-radius', footnote_size:'--dm-footnote-size' };
      for (var k in m) { if (t[k] !== undefined) r.style.setProperty(m[k], String(t[k])); }
      if (t.aspect_ratio) r.style.setProperty('--dm-aspect-ratio', t.aspect_ratio);
      document.body.classList.add('fs-transition-' + (t.transition || 'fade'));
    },
    loadFonts: function (config) {
      var t = config.theme || {}, css = '';
      if (t.heading_font && t.heading_font.indexOf('.') > -1) {
        css += '@font-face{font-family:"FlipslideHeading";src:url("' + t.heading_font + '")format("woff2");font-weight:700;font-display:swap}\n';
        document.documentElement.style.setProperty('--dm-heading-font', '"FlipslideHeading",sans-serif');
      }
      if (t.body_font && t.body_font.indexOf('.') > -1) {
        css += '@font-face{font-family:"FlipslideBody";src:url("' + t.body_font + '")format("woff2");font-weight:400;font-display:swap}\n';
        document.documentElement.style.setProperty('--dm-body-font', '"FlipslideBody",sans-serif');
      }
      if (css) { var el = document.createElement('style'); el.textContent = css; document.head.appendChild(el); }
    },
    loadExternalCSS: function (config) {
      var t = config.theme || {};
      if (t.name) {
        var tl = document.createElement('link'); tl.rel = 'stylesheet';
        tl.href = 'themes/' + t.name + '.css';
        document.head.appendChild(tl);
      }
      if (!config.external_css) return;
      var l = document.createElement('link'); l.rel = 'stylesheet'; l.href = config.external_css;
      document.head.appendChild(l);
    }
  };

  // ── Markdown ──
  var esc = function (t) { return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); };

  var Markdown = {
    _codePH: [],
    _lastFootnotes: {},

    render: function (text) {
      Markdown._codePH = [];
      return Markdown._block(text);
    },

    _block: function (text) {
      var lines = text.split('\n'), out = '', i = 0;
      var footnotes = {}, clean = [];
      for (i = 0; i < lines.length; i++) {
        var fm = lines[i].match(/^\[\^(\w+)\]:\s*(.+)$/);
        if (fm) footnotes[fm[1]] = fm[2]; else clean.push(lines[i]);
      }
      lines = clean; i = 0;

      while (i < lines.length) {
        var ln = lines[i];

        // Fenced code blocks
        if (/^```(\w*)/.test(ln)) {
          var lang = ln.match(/^```(\w*)/)[1], code = [];
          i++;
          while (i < lines.length && !/^```\s*$/.test(lines[i])) { code.push(lines[i]); i++; }
          i++;
          if (lang === 'video') { out += Markdown._video(code); }
          else if (lang === 'audio') { out += Markdown._audio(code); }
          else if (lang === 'callout') {
            out += '<div class="content-callout"><div class="callout-box">' + esc(code.join('\n')) + '</div></div>\n';
          } else {
            var ph = '\x00C' + Markdown._codePH.length + '\x00';
            Markdown._codePH.push('<pre><code' + (lang ? ' class="language-' + lang + '"' : '') + '>' + esc(code.join('\n')) + '</code></pre>\n');
            out += ph;
          }
          continue;
        }

        // Headings
        if (/^# /.test(ln)) { out += '<h1>' + Markdown._inline(ln.slice(2).trim()) + '</h1>\n'; i++; continue; }
        if (/^## /.test(ln)) { out += '<h2>' + Markdown._inline(ln.slice(3).trim()) + '</h2>\n'; i++; continue; }

        // Tables
        if (i + 1 < lines.length && /^\|/.test(ln) && /^\|[\s\-:|]+\|/.test(lines[i + 1])) {
          var tr = Markdown._table(lines, i); out += tr.html; i = tr.end; continue;
        }

        // Definition lists
        if (i + 1 < lines.length && ln.trim() !== '' && /^:\s/.test(lines[i + 1])) {
          var dl = '<div class="content-deflist"><dl>\n';
          while (i < lines.length) {
            if (lines[i].trim() === '') { i++; continue; }
            if (i + 1 < lines.length && /^:\s/.test(lines[i + 1])) {
              dl += '<dt>' + Markdown._inline(lines[i].trim()) + '</dt>\n'; i++;
              while (i < lines.length && /^:\s/.test(lines[i])) {
                dl += '<dd>' + Markdown._inline(lines[i].slice(2).trim()) + '</dd>\n'; i++;
              }
            } else break;
          }
          out += dl + '</dl></div>\n'; continue;
        }

        // Task lists
        if (/^- \[([ xX])\] /.test(ln)) {
          var tl = '<div class="content-tasklist"><ul>\n';
          while (i < lines.length && /^- \[([ xX])\] /.test(lines[i])) {
            var tm = lines[i].match(/^- \[([ xX])\] (.+)$/);
            tl += '<li><input type="checkbox"' + (tm[1] !== ' ' ? ' checked disabled' : ' disabled') + '> ' + Markdown._inline(tm[2]) + '</li>\n';
            i++;
          }
          out += tl + '</ul></div>\n'; continue;
        }

        // Unordered lists
        if (/^[-*+] /.test(ln)) {
          var ul = '<ul>\n';
          while (i < lines.length && /^[-*+] /.test(lines[i])) {
            ul += '<li>' + Markdown._inline(lines[i].replace(/^[-*+] /, '').trim()) + '</li>\n'; i++;
          }
          out += ul + '</ul>\n'; continue;
        }

        // Ordered lists
        if (/^\d+\.\s/.test(ln)) {
          var ol = '<ol>\n';
          while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
            ol += '<li>' + Markdown._inline(lines[i].replace(/^\d+\.\s/, '').trim()) + '</li>\n'; i++;
          }
          out += ol + '</ol>\n'; continue;
        }

        // Blockquotes
        if (/^>\s?/.test(ln)) {
          var bq = [];
          while (i < lines.length && /^>\s?/.test(lines[i])) { bq.push(lines[i].replace(/^>\s?/, '')); i++; }
          out += '<div class="content-blockquote"><blockquote>' + Markdown._inline(bq.join('<br>')) + '</blockquote></div>\n';
          continue;
        }

        // Separator ___
        if (/^_{3,}\s*$/.test(ln)) { out += '<hr class="slide-separator">\n'; i++; continue; }

        // Block images
        if (/^!\[/.test(ln.trim())) {
          var im = ln.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)/);
          if (im) { out += '<div class="content-image"><img src="' + esc(im[2]) + '" alt="' + esc(im[1]) + '"></div>\n'; i++; continue; }
        }

        // Empty lines
        if (ln.trim() === '') { i++; continue; }

        // Paragraphs
        var para = [];
        while (i < lines.length && lines[i].trim() !== '' &&
               !/^```/.test(lines[i]) && !/^#{1,2} /.test(lines[i]) &&
               !/^\|/.test(lines[i]) && !/^[-*+] /.test(lines[i]) &&
               !/^\d+\.\s/.test(lines[i]) && !/^>\s?/.test(lines[i]) &&
               !/^_{3,}\s*$/.test(lines[i]) && !/^!\[/.test(lines[i].trim()) &&
               !/^:\s/.test(lines[i]) && !/^\[\^/.test(lines[i])) {
          para.push(lines[i]); i++;
        }
        if (para.length) out += '<p>' + Markdown._inline(para.join(' ')) + '</p>\n';
      }

      for (var c = 0; c < Markdown._codePH.length; c++) out = out.replace('\x00C' + c + '\x00', Markdown._codePH[c]);
      Markdown._lastFootnotes = footnotes;
      return out;
    },

    _inline: function (text) {
      var spans = [];
      text = text.replace(/`([^`]+)`/g, function (_, c) {
        var idx = spans.length; spans.push('<code>' + esc(c) + '</code>'); return '\x00S' + idx + '\x00';
      });
      text = text.replace(/\[\^(\w+)\]/g, '<sup>$1</sup>');
      text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
      text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
      text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
      text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      text = text.replace(/__(.+?)__/g, '<strong>$1</strong>');
      text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
      text = text.replace(/(?<!\w)_(.+?)_(?!\w)/g, '<em>$1</em>');
      text = text.replace(/~~(.+?)~~/g, '<del>$1</del>');
      text = text.replace(/==(.+?)==/g, '<mark>$1</mark>');
      for (var j = 0; j < spans.length; j++) text = text.replace('\x00S' + j + '\x00', spans[j]);
      return text;
    },

    _table: function (lines, start) {
      var hdr = Markdown._splitRow(lines[start]);
      var aligns = Markdown._splitRow(lines[start + 1]).map(function (c) {
        var t = c.trim();
        if (t.charAt(0) === ':' && t.charAt(t.length - 1) === ':') return 'center';
        if (t.charAt(t.length - 1) === ':') return 'right';
        return 'left';
      });
      var h = '<div class="content-table"><table>\n<thead><tr>\n';
      for (var j = 0; j < hdr.length; j++) {
        var ac = aligns[j] !== 'left' ? ' class="align-' + aligns[j] + '"' : '';
        h += '<th' + ac + '>' + Markdown._inline(hdr[j].trim()) + '</th>\n';
      }
      h += '</tr></thead>\n<tbody>\n';
      var i = start + 2;
      while (i < lines.length && /^\|/.test(lines[i])) {
        var cells = Markdown._splitRow(lines[i]);
        h += '<tr>\n';
        for (var c = 0; c < cells.length; c++) {
          var ac2 = (c < aligns.length && aligns[c] !== 'left') ? ' class="align-' + aligns[c] + '"' : '';
          h += '<td' + ac2 + '>' + Markdown._inline(cells[c].trim()) + '</td>\n';
        }
        h += '</tr>\n'; i++;
      }
      return { html: h + '</tbody>\n</table></div>\n', end: i };
    },

    _splitRow: function (line) {
      var t = line.trim();
      if (t.charAt(0) === '|') t = t.slice(1);
      if (t.charAt(t.length - 1) === '|') t = t.slice(0, -1);
      return t.split('|');
    },

    _parseProps: function (lines) {
      var p = {};
      for (var i = 0; i < lines.length; i++) {
        var idx = lines[i].indexOf(':');
        if (idx > -1) p[lines[i].slice(0, idx).trim()] = lines[i].slice(idx + 1).trim();
      }
      return p;
    },

    _video: function (lines) {
      var p = Markdown._parseProps(lines), src = p.src || '';
      if (/youtube\.com|youtu\.be/.test(src)) {
        var v = src.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
        if (v) return '<div class="content-video"><iframe src="https://www.youtube.com/embed/' + v[1] + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>\n';
      }
      if (/vimeo\.com/.test(src)) {
        var vm = src.match(/vimeo\.com\/(\d+)/);
        if (vm) return '<div class="content-video"><iframe src="https://player.vimeo.com/video/' + vm[1] + '" frameborder="0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>\n';
      }
      var a = '';
      if (p.poster) a += ' poster="' + esc(p.poster) + '"';
      if (p.autoplay === 'true') a += ' autoplay';
      if (p.loop === 'true') a += ' loop';
      if (p.controls !== 'false') a += ' controls';
      return '<div class="content-video"><video src="' + esc(src) + '"' + a + '></video></div>\n';
    },

    _audio: function (lines) {
      var p = Markdown._parseProps(lines), a = '';
      if (p.autoplay === 'true') a += ' autoplay';
      if (p.loop === 'true') a += ' loop';
      if (p.controls !== 'false') a += ' controls';
      return '<audio src="' + esc(p.src || '') + '"' + a + '></audio>\n';
    }
  };

  // ── Slides ──
  var Slides = {
    split: function (content) {
      var parts = [], lines = content.split('\n'), cur = [], inCode = false;
      for (var i = 0; i < lines.length; i++) {
        if (/^```/.test(lines[i])) inCode = !inCode;
        if (!inCode && /^---\s*$/.test(lines[i])) { parts.push(cur.join('\n')); cur = []; }
        else cur.push(lines[i]);
      }
      if (cur.length) parts.push(cur.join('\n'));
      return parts.filter(function (p) { return p.trim() !== ''; });
    },

    parse: function (raw, index, config) {
      var s = { index: index, type: 'content', heading: '', subtitle: '', isSplit: false,
        splitRatio: '1fr 1fr', overrides: {}, notes: '', contentClasses: [],
        bgVariant: '', html: '', leftHtml: '', rightHtml: '', footnotes: {} };

      var om = raw.match(/<!--\s*slide:\s*([^>]+?)-->/);
      if (om) { s.overrides = Slides._parseOv(om[1]); raw = raw.replace(om[0], '').trim(); }

      var nm = raw.match(/<!--\s*notes:\s*([\s\S]*?)-->/);
      if (nm) { s.notes = nm[1].trim(); raw = raw.replace(nm[0], '').trim(); }

      var sp = Slides._splitAst(raw);
      if (sp) {
        s.isSplit = true; s.type = 'split';
        if (s.overrides.split) {
          var r = s.overrides.split.split('/');
          s.splitRatio = r[0] + 'fr ' + r[1] + 'fr';
        }
        var left = sp[0].trim(), right = sp[1].trim();
        var hm = left.match(/^(## .+)\n([\s\S]*)/);
        if (hm) { s.heading = hm[1].slice(3).trim(); left = hm[2].trim(); }
        s.leftHtml = Markdown.render(left);
        s.footnotes = Object.assign({}, Markdown._lastFootnotes);
        s.rightHtml = Markdown.render(right);
        Object.assign(s.footnotes, Markdown._lastFootnotes);
      } else {
        var tr = raw.trim();
        if (/^# /.test(tr)) {
          s.type = 'title';
          var tl = tr.split('\n'); s.heading = tl[0].slice(2).trim();
          for (var t = 1; t < tl.length; t++) {
            if (/^## /.test(tl[t])) { s.subtitle = tl[t].slice(3).trim(); break; }
          }
        } else if (/^## /.test(tr)) {
          s.heading = tr.match(/^## (.+)/)[1].trim();
        }
        s.html = Markdown.render(raw);
        s.footnotes = Object.assign({}, Markdown._lastFootnotes);
      }

      if (s.overrides.bg) s.bgVariant = s.overrides.bg;
      else if (config.background_map) {
        var tk = s.type === 'split' ? 'content' : s.type;
        if (config.background_map[tk]) s.bgVariant = config.background_map[tk];
      }

      s.contentClasses = Slides._detect(s);
      return s;
    },

    _splitAst: function (raw) {
      var lines = raw.split('\n'), inCode = false;
      for (var i = 0; i < lines.length; i++) {
        if (/^```/.test(lines[i])) inCode = !inCode;
        if (!inCode && /^\*\*\*\s*$/.test(lines[i]))
          return [lines.slice(0, i).join('\n'), lines.slice(i + 1).join('\n')];
      }
      return null;
    },

    _parseOv: function (str) {
      var ov = {}, parts = str.split(',');
      for (var i = 0; i < parts.length; i++) {
        var eq = parts[i].indexOf('=');
        if (eq > -1) ov[parts[i].slice(0, eq).trim()] = parts[i].slice(eq + 1).trim();
      }
      return ov;
    },

    _detect: function (slide) {
      var cl = [], html = slide.html + (slide.leftHtml || '') + (slide.rightHtml || '');
      if (/<ul|<ol/.test(html)) cl.push('has-list');
      if (/<table/.test(html)) cl.push('has-table');
      if (/content-image|<img/.test(html)) cl.push('has-image');
      if (/content-video/.test(html)) cl.push('has-video');
      if (/<p>/.test(html)) cl.push('has-text');
      if (/<pre><code/.test(html)) cl.push('has-code');
      if (/content-blockquote/.test(html)) cl.push('has-blockquote');
      if (/content-callout/.test(html)) cl.push('has-callout');
      if (/content-deflist/.test(html)) cl.push('has-deflist');
      if (/content-tasklist/.test(html)) cl.push('has-tasklist');
      if (!slide.heading && slide.type !== 'title') cl.push('content-only');

      var elTypes = ['has-list','has-table','has-image','has-video','has-code',
        'has-blockquote','has-callout','has-deflist','has-tasklist','has-text'];
      var found = elTypes.filter(function (c) { return cl.indexOf(c) > -1; });
      if (found.length === 1) {
        if (found[0] === 'has-image') cl.push('image-only');
        if (found[0] === 'has-list') cl.push('list-only');
        if (found[0] === 'has-table') cl.push('table-only');
      }
      return cl;
    }
  };

  // ── Dom ──
  var Dom = {
    build: function (slides, config) {
      var deck = document.getElementById('fs-deck');
      var bgs = config.backgrounds || {}, brand = config.branding || {};
      var sOv = config.slide_overrides || {};

      for (var i = 0; i < slides.length; i++) {
        var s = slides[i], sec = document.createElement('section');
        sec.className = 'slide slide-' + s.type;
        for (var cc = 0; cc < s.contentClasses.length; cc++) sec.classList.add(s.contentClasses[cc]);
        if (i === 0) sec.classList.add('slide-active');

        // Background variant
        if (s.bgVariant) {
          sec.setAttribute('data-bg', s.bgVariant);
          var bg = bgs[s.bgVariant];
          if (bg) {
            if (bg.color) sec.style.backgroundColor = bg.color;
            if (bg.image) {
              if (/\.svg$/i.test(bg.image)) {
                SvgTheme.applyTo(sec, bg.image, config);
              } else {
                sec.style.backgroundImage = 'url(' + bg.image + ')';
              }
              if (bg.size) sec.style.backgroundSize = bg.size;
              if (bg.position) sec.style.backgroundPosition = bg.position;
            }
          }
        }

        // Per-slide background image
        if (s.overrides.background) {
          if (/\.svg$/i.test(s.overrides.background)) {
            SvgTheme.applyTo(sec, s.overrides.background, config);
          } else {
            sec.style.backgroundImage = 'url(' + s.overrides.background + ')';
          }
          sec.style.backgroundSize = 'cover';
          sec.style.backgroundPosition = 'center';
          sec.classList.add('slide-bg');
        }

        // Type-level overrides from config
        var tk = s.type === 'split' ? 'content' : s.type;
        var tOv = Object.assign({}, sOv[tk] || {});
        for (var cc2 = 0; cc2 < s.contentClasses.length; cc2++) {
          var cOv = sOv[s.contentClasses[cc2]];
          if (cOv) Object.assign(tOv, cOv);
        }
        Dom._applyOv(sec, tOv);
        Dom._applyOv(sec, s.overrides);

        if (s.overrides['class']) {
          s.overrides['class'].split(' ').forEach(function (c) { sec.classList.add(c); });
        }

        // Build inner HTML
        if (s.isSplit) {
          if (s.heading) sec.innerHTML = '<h2>' + Markdown._inline(s.heading) + '</h2>';
          var body = document.createElement('div');
          body.className = 'slide-body';
          body.style.gridTemplateColumns = s.splitRatio;
          var left = document.createElement('div'); left.className = 'split-left'; left.innerHTML = s.leftHtml;
          var right = document.createElement('div'); right.className = 'split-right'; right.innerHTML = s.rightHtml;
          body.appendChild(left); body.appendChild(right); sec.appendChild(body);
        } else {
          sec.innerHTML = s.html;
        }

        // Attribution: last paragraph that is purely italic → .slide-footnote
        var paras = sec.querySelectorAll('p');
        if (paras.length) {
          var last = paras[paras.length - 1], fc = last.firstChild;
          if (last.childNodes.length === 1 && fc && fc.nodeType === 1 && fc.tagName === 'EM')
            last.classList.add('slide-footnote');
        }

        // Footnotes
        if (s.footnotes && Object.keys(s.footnotes).length) {
          var fnc = document.createElement('div'); fnc.className = 'slide-footnotes';
          for (var fk in s.footnotes) {
            var fp = document.createElement('p');
            fp.innerHTML = '<sup>' + fk + '</sup> ' + Markdown._inline(s.footnotes[fk]);
            fnc.appendChild(fp);
          }
          sec.appendChild(fnc);
        }

        // Logo
        if (brand.logo) {
          var excl = brand.logo_exclude || [];
          if (excl.indexOf(i + 1) === -1) {
            var logo = document.createElement('img');
            logo.className = 'slide-logo'; logo.src = brand.logo; logo.alt = '';
            logo.setAttribute('data-pos', brand.logo_position || 'TR');
            logo.style.width = brand.logo_size || '4vw';
            logo.style.opacity = brand.logo_opacity !== undefined ? brand.logo_opacity : 0.8;
            sec.appendChild(logo);
          }
        }

        deck.appendChild(sec);
      }

      // Progress bar & slide number
      var th = config.theme || {};
      if (th.progress_bar) {
        var bar = document.createElement('div'); bar.className = 'progress-bar';
        bar.style.width = (1 / slides.length * 100) + '%'; document.body.appendChild(bar);
      }
      if (th.slide_number) {
        var num = document.createElement('div'); num.className = 'slide-number';
        num.setAttribute('data-position', th.slide_number_location || 'BR');
        var fmt = th.slide_number_format || '{current}';
        num.textContent = fmt.replace('{current}', '1').replace('{total}', String(slides.length));
        document.body.appendChild(num);
      }
    },

    _applyOv: function (el, ov) {
      var m = { 'bg-color':'--dm-bg', 'text':'--dm-text', 'accent':'--dm-accent',
        'heading-size':'--dm-heading-size', 'body-size':'--dm-body-size', 'padding':'--dm-slide-padding' };
      for (var k in m) { if (ov[k]) el.style.setProperty(m[k], ov[k]); }
    }
  };

  // ── Nav ──
  var Nav = {
    current: 0, total: 0, _config: {}, _touchX: 0,

    init: function (total, config) {
      Nav.total = total; Nav._config = config;
      Nav.current = Nav._hash() || 0;
      Nav._show(Nav.current);
      document.addEventListener('keydown', Nav._onKey);
      document.addEventListener('click', Nav._onClick);
      document.addEventListener('touchstart', function (e) { Nav._touchX = e.changedTouches[0].clientX; }, { passive: true });
      document.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - Nav._touchX;
        if (Math.abs(dx) > 50) { dx < 0 ? Nav.next() : Nav.prev(); }
      }, { passive: true });
      window.addEventListener('hashchange', function () {
        var idx = Nav._hash(); if (idx !== null && idx !== Nav.current) Nav.goTo(idx);
      });
    },

    next: function () { if (Nav.current < Nav.total - 1) Nav.goTo(Nav.current + 1); },
    prev: function () { if (Nav.current > 0) Nav.goTo(Nav.current - 1); },

    goTo: function (n) {
      if (n < 0 || n >= Nav.total) return;
      Nav.current = n; Nav._show(n);
      window.location.hash = '#' + (n + 1); Nav._updateUI();
    },

    _show: function (n) {
      var sl = document.querySelectorAll('.slide');
      for (var i = 0; i < sl.length; i++) sl[i].classList.toggle('slide-active', i === n);
    },

    _updateUI: function () {
      var th = Nav._config.theme || {};
      if (th.progress_bar) {
        var b = document.querySelector('.progress-bar');
        if (b) b.style.width = ((Nav.current + 1) / Nav.total * 100) + '%';
      }
      if (th.slide_number) {
        var n = document.querySelector('.slide-number');
        if (n) {
          var f = th.slide_number_format || '{current}';
          n.textContent = f.replace('{current}', String(Nav.current + 1)).replace('{total}', String(Nav.total));
        }
      }
    },

    _hash: function () {
      var h = window.location.hash.slice(1); if (!h) return null;
      var n = parseInt(h, 10); if (isNaN(n) || n < 1) return null;
      return Math.min(n - 1, Nav.total - 1);
    },

    _onKey: function (e) {
      switch (e.key) {
        case 'ArrowRight': case ' ': e.preventDefault(); Nav.next(); break;
        case 'ArrowLeft': e.preventDefault(); Nav.prev(); break;
        case 'Home': e.preventDefault(); Nav.goTo(0); break;
        case 'End': e.preventDefault(); Nav.goTo(Nav.total - 1); break;
        case 'f': case 'F11': e.preventDefault();
          if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function(){});
          else document.exitFullscreen(); break;
        case 'Escape': if (document.fullscreenElement) document.exitFullscreen(); break;
      }
    },

    _onClick: function (e) {
      if (e.target.closest('a,button,input,.fs-test-results')) return;
      e.clientX > window.innerWidth / 2 ? Nav.next() : Nav.prev();
    }
  };

  // ── AutoFit ──
  var AutoFit = {
    run: function (config) {
      var th = config.theme || {};
      if (!th.autofit) return;
      var minVw = parseFloat(th.autofit_min) || 1.2;
      var sl = document.querySelectorAll('.slide');
      for (var i = 0; i < sl.length; i++) {
        var iter = 0;
        while (iter < 10 && sl[i].scrollHeight > sl[i].clientHeight + 2) {
          var cur = parseFloat(getComputedStyle(sl[i]).fontSize);
          var nxt = cur * 0.9;
          if (nxt < minVw * window.innerWidth / 100) break;
          sl[i].style.fontSize = nxt + 'px'; iter++;
        }
      }
    }
  };

  // ── ContentFit ──
  // Prevents text and structural content from overflowing slide bounds.
  // Pass 1: Compress spacing on lists, tables, blockquotes, definition lists.
  // Pass 1.5: Compress table cell padding and border-spacing.
  // Pass 2: Reduce font-size on those elements.
  // Pass 3: If still overflowing, reduce overall slide font-size.
  var ContentFit = {
    SPACING: [
      ['0.35em', '1.4', '0.2em'],
      ['0.2em',  '1.3', '0.1em'],
      ['0.1em',  '1.2', '0'],
      ['0',      '1.1', '0']
    ],
    MIN_SCALE: 0.65,
    FONT_STEP: 0.05,

    run: function () {
      var slides = document.querySelectorAll('.slide');
      for (var i = 0; i < slides.length; i++) {
        ContentFit._fit(slides[i]);
      }
    },

    _over: function (el) { return el.scrollHeight > el.clientHeight + 2; },

    _fit: function (slide) {
      if (!ContentFit._over(slide)) return;

      var lists = slide.querySelectorAll('ul, ol');
      var tables = slide.querySelectorAll('table');
      var dls = slide.querySelectorAll('dl');
      var blockquotes = slide.querySelectorAll('blockquote');
      var hasStructural = lists.length || tables.length || dls.length || blockquotes.length;

      // Pass 1: Compress spacing on structural elements
      if (hasStructural) {
        var items = slide.querySelectorAll('li');
        var dlItems = slide.querySelectorAll('dt, dd');
        for (var s = 0; s < ContentFit.SPACING.length; s++) {
          var sp = ContentFit.SPACING[s];
          for (var j = 0; j < items.length; j++) {
            items[j].style.marginBottom = sp[0];
            items[j].style.lineHeight = sp[1];
          }
          for (var d = 0; d < dlItems.length; d++) {
            dlItems[d].style.marginBottom = sp[0];
          }
          for (var k = 0; k < lists.length; k++) {
            lists[k].style.marginTop = sp[2];
            lists[k].style.marginBottom = sp[2];
          }
          for (var t = 0; t < tables.length; t++) {
            tables[t].style.marginTop = sp[2];
            tables[t].style.marginBottom = sp[2];
          }
          for (var b = 0; b < blockquotes.length; b++) {
            blockquotes[b].style.marginTop = sp[2];
            blockquotes[b].style.marginBottom = sp[2];
          }
          if (!ContentFit._over(slide)) return;
        }
      }

      // Pass 1.5: Compress table cell padding and border-spacing
      if (tables.length && ContentFit._over(slide)) {
        var cells = slide.querySelectorAll('td, th');
        var cellPaddings = ['0.4em', '0.3em', '0.2em', '0.1em', '0'];
        for (var cp = 0; cp < cellPaddings.length; cp++) {
          for (var c = 0; c < cells.length; c++) {
            cells[c].style.padding = cellPaddings[cp];
            cells[c].style.lineHeight = '1.2';
          }
          for (var ts = 0; ts < tables.length; ts++) {
            tables[ts].style.borderCollapse = 'collapse';
            tables[ts].style.borderSpacing = '0';
          }
          if (!ContentFit._over(slide)) return;
        }
      }

      // Pass 2: Reduce font-size on structural elements
      if (hasStructural) {
        var baseFontSize = lists.length ? parseFloat(getComputedStyle(lists[0]).fontSize) :
                           tables.length ? parseFloat(getComputedStyle(tables[0]).fontSize) :
                           dls.length ? parseFloat(getComputedStyle(dls[0]).fontSize) :
                           parseFloat(getComputedStyle(blockquotes[0]).fontSize);
        var scale = 1.0;
        while (scale - ContentFit.FONT_STEP >= ContentFit.MIN_SCALE) {
          scale -= ContentFit.FONT_STEP;
          var size = (baseFontSize * scale).toFixed(2) + 'px';
          for (var l = 0; l < lists.length; l++) lists[l].style.fontSize = size;
          for (var tb = 0; tb < tables.length; tb++) tables[tb].style.fontSize = size;
          for (var dl = 0; dl < dls.length; dl++) dls[dl].style.fontSize = size;
          for (var bq = 0; bq < blockquotes.length; bq++) blockquotes[bq].style.fontSize = size;
          if (!ContentFit._over(slide)) return;
        }
      }

      // Pass 3: Reduce overall slide font-size as last resort
      var slideBase = parseFloat(getComputedStyle(slide).fontSize);
      var slideScale = 1.0;
      while (slideScale - ContentFit.FONT_STEP >= ContentFit.MIN_SCALE) {
        slideScale -= ContentFit.FONT_STEP;
        var slideSize = (slideBase * slideScale).toFixed(2) + 'px';
        slide.style.fontSize = slideSize;
        if (!ContentFit._over(slide)) return;
      }
    }
  };

  // ── SvgTheme ──
  var SvgTheme = {
    _cache: {},

    _hexToHsl: function (hex) {
      var r = parseInt(hex.slice(1, 3), 16) / 255;
      var g = parseInt(hex.slice(3, 5), 16) / 255;
      var b = parseInt(hex.slice(5, 7), 16) / 255;
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var l = (max + min) / 2, s = 0, h = 0;
      if (max !== min) {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
      }
      return [h * 360, s, l];
    },

    _hslToHex: function (h, s, l) {
      h /= 360;
      var r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        var hue2rgb = function (p, q, t) {
          if (t < 0) t += 1; if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      var toHex = function (c) { var v = Math.round(c * 255).toString(16); return v.length === 1 ? '0' + v : v; };
      return '#' + toHex(r) + toHex(g) + toHex(b);
    },

    // Recolour the four hardcoded Observatory SVG values with theme-derived equivalents.
    // The three bg stops are offset from bg luminance; direction flips for light-mode themes.
    // Threshold is skewed dark: anything with L < 0.45 is treated as dark mode.
    _recolour: function (svgText, accentHex, bgHex) {
      var hsl = SvgTheme._hexToHsl(bgHex);
      var h = hsl[0], s = hsl[1], l = hsl[2];
      // Offsets derived from original dark-mode stops relative to #0f172a (L≈0.112):
      //   centre #151f35 = bg +0.033 L  |  edge #070b15 = bg −0.057 L
      // Light mode (L >= 0.45): invert so the radial spotlight reads correctly.
      var isDark = l < 0.45;
      var cOff = isDark ?  0.033 : -0.033;
      var eOff = isDark ? -0.057 :  0.057;
      var centre = SvgTheme._hslToHex(h, s, Math.max(0, Math.min(1, l + cOff)));
      var edge   = SvgTheme._hslToHex(h, s, Math.max(0, Math.min(1, l + eOff)));
      svgText = svgText.replace(/#151f35/gi, centre);
      svgText = svgText.replace(/#0f172a/gi, bgHex);
      svgText = svgText.replace(/#070b15/gi, edge);
      svgText = svgText.replace(/#38bdf8/gi, accentHex);
      return svgText;
    },

    applyTo: function (el, svgUrl, config) {
      var t = config.theme || {};
      var style = getComputedStyle(document.documentElement);
      var bg     = (t.background || style.getPropertyValue('--dm-bg').trim()     || '#0f172a').trim();
      var accent = (t.accent     || style.getPropertyValue('--dm-accent').trim() || '#38bdf8').trim();

      // Require full 6-digit hex; fall back to raw URL if colours are non-hex
      if (!/^#[0-9a-f]{6}$/i.test(bg) || !/^#[0-9a-f]{6}$/i.test(accent)) {
        el.style.backgroundImage = 'url(' + svgUrl + ')';
        return;
      }

      var cacheKey = svgUrl + '|' + bg + '|' + accent;
      var pendingKey = cacheKey + '_p';

      if (SvgTheme._cache[cacheKey]) {
        el.style.backgroundImage = 'url("' + SvgTheme._cache[cacheKey] + '")';
        return;
      }

      // 1. Inline <script type="image/svg+xml" data-fs-src="..."> — works from file://
      var tags = document.querySelectorAll('script[type="image/svg+xml"]');
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].getAttribute('data-fs-src') === svgUrl) {
          var uri = 'data:image/svg+xml,' + encodeURIComponent(SvgTheme._recolour(tags[i].textContent, accent, bg));
          SvgTheme._cache[cacheKey] = uri;
          el.style.backgroundImage = 'url("' + uri + '")';
          return;
        }
      }

      // 2. XHR — works from HTTP; set raw CSS URL as visible fallback while loading
      el.style.backgroundImage = 'url(' + svgUrl + ')';
      if (SvgTheme._cache[pendingKey]) {
        SvgTheme._cache[pendingKey].push(el);
        return;
      }
      SvgTheme._cache[pendingKey] = [el];

      var xhr = new XMLHttpRequest();
      xhr.open('GET', svgUrl, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200 && !(xhr.status === 0 && xhr.responseText)) return;
        var uri = 'data:image/svg+xml,' + encodeURIComponent(SvgTheme._recolour(xhr.responseText, accent, bg));
        SvgTheme._cache[cacheKey] = uri;
        var pending = SvgTheme._cache[pendingKey] || [];
        for (var i = 0; i < pending.length; i++) pending[i].style.backgroundImage = 'url("' + uri + '")';
        delete SvgTheme._cache[pendingKey];
      };
      xhr.send();
    }
  };

  // ── Test ──
  var Test = {
    results: [],

    run: function (slides, config) {
      if (!location.search.includes('test')) return;
      Test.results = [];
      Test._yaml(); Test._md(); Test._slides(slides, config);
      Test._dom(config); Test._nav(slides.length); Test._render();
    },

    ok: function (name, cond) { Test.results.push({ name: name, pass: !!cond }); },

    _yaml: function () {
      var r = Yaml.parse('name: hello\ncount: 42');
      Test.ok('YAML: string value', r.name === 'hello');
      Test.ok('YAML: number value', r.count === 42);
      var r2 = Yaml.parse('p:\n  c: val\n  d:\n    l: true');
      Test.ok('YAML: nested object', r2.p && r2.p.c === 'val');
      Test.ok('YAML: 3-level nesting', r2.p && r2.p.d && r2.p.d.l === true);
      var r3 = Yaml.parse('c: "#ff0"\nn: \'hi\'');
      Test.ok('YAML: double-quoted', r3.c === '#ff0');
      Test.ok('YAML: single-quoted', r3.n === 'hi');
      var r4 = Yaml.parse('a: true\nb: false');
      Test.ok('YAML: bool true', r4.a === true);
      Test.ok('YAML: bool false', r4.b === false);
      var r5 = Yaml.parse('i: [1, 2, 3]');
      Test.ok('YAML: inline array', Array.isArray(r5.i) && r5.i.length === 3);
      var r6 = Yaml.parse('v: hello # comment');
      Test.ok('YAML: inline comment', r6.v === 'hello');
    },

    _md: function () {
      var R = Markdown.render.bind(Markdown), ok = Test.ok;
      ok('MD: H1', R('# Hello').includes('<h1>Hello</h1>'));
      ok('MD: H2', R('## World').includes('<h2>World</h2>'));
      ok('MD: bold', R('**bold**').includes('<strong>bold</strong>'));
      ok('MD: italic', R('*italic*').includes('<em>italic</em>'));
      ok('MD: bold+italic', R('***both***').includes('<strong><em>both</em></strong>'));
      ok('MD: inline code', R('`code`').includes('<code>code</code>'));
      ok('MD: strikethrough', R('~~del~~').includes('<del>del</del>'));
      ok('MD: highlight', R('==mark==').includes('<mark>mark</mark>'));
      ok('MD: unordered list', R('- A\n- B').includes('<ul>'));
      ok('MD: ordered list', R('1. A\n2. B').includes('<ol>'));
      ok('MD: task list', R('- [ ] T\n- [x] D').includes('content-tasklist'));
      ok('MD: table', R('| A | B |\n|---|---|\n| 1 | 2 |').includes('<table>'));
      ok('MD: table align', R('| L | C | R |\n|:--|:--:|--:|\n| a | b | c |').includes('align-center'));
      ok('MD: blockquote', R('> Q').includes('<blockquote>'));
      ok('MD: deflist', R('Term\n: Def').includes('<dl>'));
      ok('MD: code block', R('```js\nx<1\n```').includes('&lt;'));
      ok('MD: block image', R('![A](t.png)').includes('content-image'));
      R('T[^1]\n\n[^1]: FN text');
      ok('MD: footnotes', Markdown._lastFootnotes['1'] === 'FN text');
      ok('MD: separator', R('___').includes('slide-separator'));
      ok('MD: paragraph', R('Just text').includes('<p>'));
      ok('MD: callout', R('```callout\nBig\n```').includes('callout-box'));
    },

    _slides: function (slides, config) {
      var ok = Test.ok;
      ok('Slides: count=7', slides.length === 7);
      ok('Slides: #1 title', slides[0].type === 'title');
      ok('Slides: #2 content', slides[1].type === 'content');
      ok('Slides: #5 split', slides[4].type === 'split');
      ok('Slides: #6 bg=c', slides[5] && slides[5].overrides.bg === 'c');
      ok('Slides: #6 heading-size', slides[5] && slides[5].overrides['heading-size'] === '6vw');
      ok('Slides: #1 notes', slides[0].notes.indexOf('Welcome') > -1);
      ok('Slides: split leftHtml', slides[4].leftHtml !== '');
      ok('Slides: split rightHtml', slides[4].rightHtml !== '');
      ok('Slides: #2 has-table', slides[1].contentClasses.indexOf('has-table') > -1);
      ok('Slides: #3 has-callout', slides[2].contentClasses.indexOf('has-callout') > -1);
      ok('Slides: #4 has-list', slides[3].contentClasses.indexOf('has-list') > -1);
      ok('Slides: #6 has-tasklist', slides[5].contentClasses.indexOf('has-tasklist') > -1);
    },

    _dom: function (config) {
      var ok = Test.ok, sl = document.querySelectorAll('.slide');
      ok('DOM: 7 slides', sl.length === 7);
      ok('DOM: #1 active', sl[0].classList.contains('slide-active'));
      ok('DOM: #1 title class', sl[0].classList.contains('slide-title'));
      var sp = document.querySelector('.slide-split');
      ok('DOM: split exists', !!sp);
      if (sp) {
        ok('DOM: split-left', !!sp.querySelector('.split-left'));
        ok('DOM: split-right', !!sp.querySelector('.split-right'));
      }
      ok('DOM: data-bg set', !!document.querySelector('[data-bg]'));
      if (config.branding && config.branding.logo) {
        ok('DOM: logos present', document.querySelectorAll('.slide-logo').length > 0);
        ok('DOM: logo excluded #1', !sl[0].querySelector('.slide-logo'));
      }
      var th = config.theme || {};
      if (th.progress_bar) ok('DOM: progress bar', !!document.querySelector('.progress-bar'));
      if (th.slide_number) ok('DOM: slide number', !!document.querySelector('.slide-number'));
      ok('DOM: footnotes', document.querySelectorAll('.slide-footnotes').length > 0);
      ok('DOM: attribution', document.querySelectorAll('.slide-footnote').length > 0);
    },

    _nav: function (total) {
      var ok = Test.ok, orig = Nav.current;
      Nav.goTo(0); Nav.next(); ok('Nav: next()', Nav.current === 1);
      Nav.prev(); ok('Nav: prev()', Nav.current === 0);
      Nav.goTo(3); ok('Nav: goTo(3)', Nav.current === 3);
      Nav.goTo(0); Nav.prev(); ok('Nav: floor=0', Nav.current === 0);
      Nav.goTo(total - 1); Nav.next(); ok('Nav: ceil', Nav.current === total - 1);
      Nav.goTo(orig);
    },

    _render: function () {
      var el = document.createElement('div');
      el.id = 'fs-test-results'; el.className = 'fs-test-results';
      var pass = 0, fail = 0;
      for (var i = 0; i < Test.results.length; i++) Test.results[i].pass ? pass++ : fail++;
      el.setAttribute('style', 'position:fixed;top:1.5vw;right:1.5vw;width:30vw;max-height:90vh;overflow-y:auto;background:rgba(10,12,18,0.92);border:1px solid rgba(255,255,255,0.12);border-radius:0.8vw;padding:1.5vw;font-family:"SF Mono","Fira Code",monospace;font-size:1.1vw;line-height:1.6;z-index:9999;color:#e0e0e0;backdrop-filter:blur(12px)');
      var h = '<div style="font-size:1.4vw;font-weight:700;margin-bottom:1vw;padding-bottom:0.8vw;border-bottom:1px solid rgba(255,255,255,0.1)">';
      h += '<span style="color:#38bdf8">Flipslide Tests</span> — ';
      h += fail === 0
        ? '<span style="color:#34d399">ALL ' + pass + ' PASSED</span>'
        : '<span style="color:#34d399">' + pass + ' pass</span>, <span style="color:#f87171">' + fail + ' fail</span>';
      h += '</div>';
      for (var j = 0; j < Test.results.length; j++) {
        var r = Test.results[j], p = r.pass;
        h += '<div style="color:' + (p ? 'rgba(255,255,255,0.7)' : '#f87171;font-weight:600') + '">';
        h += '<span style="color:' + (p ? '#34d399' : '#f87171') + ';margin-right:0.4vw">' + (p ? '✓' : '✗') + '</span>';
        h += r.name + '</div>';
      }
      el.innerHTML = h;
      document.body.appendChild(el);
    }
  };

  // ── Init ──
  function loadDeck(callback) {
    // 1. Inline <script id="fs-source"> (works from file://)
    var inline = document.getElementById('fs-source');
    if (inline && inline.textContent.trim()) {
      return callback(null, inline.textContent);
    }
    // 2. Fallback: XHR to deck.md (works from http server)
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'deck.md', true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText))
        callback(null, xhr.responseText);
      else callback(new Error('No deck found. Embed markdown in a &lt;script id="fs-source" type="text/markdown"&gt; tag, or serve via HTTP with a deck.md file.'));
    };
    xhr.send();
  }

  function boot(md) {
    var result = Config.extract(md), config = result.config, content = result.content;
    Config.applyTheme(config);
    Config.loadFonts(config);
    Config.loadExternalCSS(config);
    var rawSlides = Slides.split(content);
    var slides = rawSlides.map(function (r, i) { return Slides.parse(r, i, config); });
    Dom.build(slides, config);
    Nav.init(slides.length, config);
    AutoFit.run(config);
    ContentFit.run();
    document.body.classList.add('fs-ready');
    if (slides.length && slides[0].heading) document.title = slides[0].heading;
    Test.run(slides, config);
  }

  function init() {
    loadDeck(function (err, md) {
      if (err) {
        document.body.classList.add('fs-ready');
        document.body.innerHTML = '<div style="padding:4vw;color:#f87171;font-family:sans-serif"><h1 style="font-size:3vw">Flipslide Error</h1><p style="font-size:1.8vw;margin-top:1vw">' + err.message + '</p></div>';
        return;
      }
      boot(md);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
