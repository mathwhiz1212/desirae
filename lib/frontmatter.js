/*jshint -W054 */
;(function (exports) {
  'use strict';

  function create(Desi) {
    Desi.YAML           = {};
    Desi.YAML.parse     = (exports.jsyaml || require('js-yaml')).load;
    Desi.YAML.stringify = (exports.jsyaml || require('js-yaml')).dump;

    function readFrontMatter(text) {
      var lines
        , line
        , padIndent = ''
        , ymllines = []
        ;

      lines = text.split(/\n/);
      line = lines.shift();

      if (!line.match(/^---\s*$/)) {
        return;
      }

      // our yaml parser can't handle objects
      // that start without indentation, so
      // we can add it if this is the case
      if (lines[0] && lines[0].match(/^\S/)) {
        padIndent = '';
      }

      while (true) {
        line = lines.shift();

        // premature end-of-file (unsupported yaml)
        if (!line && '' !== line) {
          ymllines = [];
          break;
        }

        // end-of-yaml front-matter
        if (line.match(/^---\s*$/)) {
          break;
        }

        if (line) {
          // supported yaml
          ymllines.push(padIndent + line); 
        }
      }


      // XXX can't be sorted because arrays get messed up
      //ymllines.sort();
      if (ymllines) {
        return '---\n' + ymllines.join('\n');
      }

      return;
    }

    function separateText(text, fm) {
      var len
        , yml
        ;

      yml = readFrontMatter(fm);
      // strip frontmatter from text, if any
      // including trailing '---' (which is accounted for by the added '\n')
      if (yml) {
        len = fm.split(/\n/).length + 1;
      } else {
        len = 0;
      }

      return text.split(/\n/).slice(len).join('\n');
    }

    function parseText(text) {
      var fm = readFrontMatter(text)
        , body = fm && separateText(text, fm)
        , yml
        ;

      if (fm) {
        try {
          yml = Desi.YAML.parse(fm);
        } catch(e) {
          //
        }
      }

      return {
        yml: yml
      , frontmatter: fm
      , body: body
      };
    }

    exports.Frontmatter = {};
    exports.Frontmatter.Frontmatter = exports.Frontmatter;
    exports.Frontmatter.readText = readFrontMatter;
    exports.Frontmatter.separateText = separateText;
    exports.Frontmatter.parse = parseText;
    exports.Frontmatter.YAML = Desi.YAML;
    Desi.Frontmatter = exports.Frontmatter;

    return exports;
  }

  if (exports.Desirae) {
    create(exports.Desirae);
  } else {
    exports.create = create;
  }
}('undefined' !== typeof exports && exports || window));
