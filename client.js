/* dsh-pet-prince · browser half
 * Loaded by DSH's module loader as /plugins/dsh-pet-prince/client.js.
 * No top-level import/export: React is resolved through the loader factory.
 */
(function () {
  if (typeof window === "undefined" || !window.__ModuleLoader__) return;

  var ID = "dsh-pet-prince";
  var SPRITE = "/dsh-pet-prince/spritesheet.webp?v=4";
  var CONFIG_URL = "/dsh-pet-prince/config";
  var POS_KEY = "dsh-pet-prince:position";

  var FRAME_W = 384;
  var FRAME_H = 416;
  var DISPLAY = 0.66;
  var COLS = 8;
  var ROWS = 9;

  var ANIM = {
    idle: { row: 0, frames: 6, ms: 180, label: "待机" },
    running_right: { row: 1, frames: 8, ms: 90, label: "向右跑" },
    running_left: { row: 2, frames: 8, ms: 90, label: "向左跑" },
    waving: { row: 3, frames: 4, ms: 160, label: "挥手" },
    jumping: { row: 4, frames: 5, ms: 110, label: "跳跃" },
    failed: { row: 5, frames: 8, ms: 120, label: "失败" },
    waiting: { row: 6, frames: 6, ms: 180, label: "等待" },
    running: { row: 7, frames: 6, ms: 100, label: "跑动" },
    review: { row: 8, frames: 6, ms: 160, label: "检查" },
  };

  var DEFAULTS = { enabled: true, scale: 1, corner: "bottom-right", marginX: 24, marginY: 16 };

  var CSS = [
    ".dpp-root{position:fixed;z-index:40;pointer-events:none;user-select:none}",
    ".dpp-sprite{pointer-events:auto;cursor:grab;background-repeat:no-repeat;image-rendering:auto;touch-action:none;filter:drop-shadow(0 8px 14px rgba(3,8,20,.35));transition:filter .15s ease;animation:dpp-float 3.2s ease-in-out infinite}",
    "@keyframes dpp-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}",
    ".dpp-sprite:hover{filter:drop-shadow(0 10px 18px rgba(3,8,20,.5)) brightness(1.03)}",
    ".dpp-sprite:active{cursor:grabbing}",
    ".dpp-toolbar{position:absolute;left:50%;top:-42px;transform:translateX(-50%);display:flex;gap:2px;padding:4px;border:1px solid var(--dsw-alias-border-l2,#34415e);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#111b33);box-shadow:0 8px 24px rgba(0,0,0,.35);opacity:.92;pointer-events:auto;transition:opacity .15s ease}",
    ".dpp-root:hover .dpp-toolbar{opacity:1}",
    ".dpp-toolbar button{padding:4px 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#e8eefc);font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}",
    ".dpp-toolbar button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08))}",
    "@media (prefers-reduced-motion: reduce){.dpp-sprite{animation:none}}",
    ".dpp-menu{position:fixed;z-index:10000;min-width:148px;padding:6px;border:1px solid var(--dsw-alias-border-l2,#34415e);border-radius:10px;background:var(--dsw-alias-bg-layer-1,#111b33);box-shadow:0 12px 32px rgba(0,0,0,.45);backdrop-filter:blur(10px)}",
    ".dpp-menu-title{padding:4px 8px 6px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8291b3);letter-spacing:.08em}",
    ".dpp-menu button{display:flex;align-items:center;width:100%;padding:6px 8px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary,#e8eefc);font:inherit;font-size:13px;text-align:left;cursor:pointer}",
    ".dpp-menu button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08))}",
    ".dpp-menu button.danger{color:#ff9c9c}",
    ".dpp-settings{display:flex;flex-direction:column;gap:14px;max-width:720px;font-size:13px;line-height:20px;color:var(--dsw-alias-label-primary,#e8eefc)}",
    ".dpp-settings h3{margin:0;font-size:16px;font-weight:500}",
    ".dpp-settings p{margin:0;color:var(--dsw-alias-label-tertiary,#8291b3);font-size:12px;line-height:18px}",
    ".dpp-card{display:flex;flex-direction:column;gap:10px;padding:12px 14px;border:1px solid var(--dsw-alias-border-l2,#34415e);border-radius:12px}",
    ".dpp-row{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;align-items:end}",
    ".dpp-field{display:flex;flex-direction:column;gap:4px;min-width:0}",
    ".dpp-field span{font-size:12px;color:var(--dsw-alias-label-secondary,#aab8d6)}",
    ".dpp-field input[type=number],.dpp-field select{box-sizing:border-box;width:100%;height:28px;padding:2px 8px;border:1px solid var(--dsw-alias-border-l2,#34415e);border-radius:8px;background:var(--dsw-alias-bg-layer-1,#111b33);color:inherit;font:inherit;font-size:13px;outline:none}",
    ".dpp-field input[type=range]{width:100%;accent-color:var(--dsw-alias-state-business-primary,#4f8cff)}",
    ".dpp-check{display:flex;align-items:center;gap:8px;font-size:13px}",
    ".dpp-check input{width:16px;height:16px;accent-color:var(--dsw-alias-state-business-primary,#4f8cff)}",
    ".dpp-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}",
    ".dpp-btn{padding:4px 14px;border:1px solid var(--dsw-alias-border-l2,#34415e);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:12px;line-height:20px;cursor:pointer}",
    ".dpp-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(255,255,255,.08))}",
    ".dpp-btn.primary{border-color:var(--dsw-alias-button-info-fill,#4f8cff);background:var(--dsw-alias-button-info-fill,#4f8cff);color:#fff}",
    ".dpp-msg{font-size:12px;color:#7fd6a8;margin-left:4px}",
    ".dpp-msg.err{color:#ff9c9c}",
    ".dpp-badge{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border:1px solid var(--dsw-alias-border-l2,#34415e);border-radius:999px;font-size:11px;color:var(--dsw-alias-label-tertiary,#8291b3)}",
  ].join("\n");

  function injectCss() {
    if (typeof document === "undefined") return;
    if (document.querySelector('style[data-plugin-css="dsh-pet-prince/style.css"]')) return;
    var tag = document.createElement("style");
    tag.dataset.plugin = ID;
    tag.dataset.pluginCss = "dsh-pet-prince/style.css";
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }

  function readLocalPos() {
    try {
      var raw = localStorage.getItem(POS_KEY);
      if (!raw) return null;
      var value = JSON.parse(raw);
      if (value && Number.isFinite(value.x) && Number.isFinite(value.y)) return value;
    } catch (_) {}
    return null;
  }

  function writeLocalPos(value) {
    try {
      if (value) localStorage.setItem(POS_KEY, JSON.stringify(value));
      else localStorage.removeItem(POS_KEY);
    } catch (_) {}
  }

  async function getConfig() {
    try {
      var res = await fetch(CONFIG_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    } catch (_) {
      return Object.assign({}, DEFAULTS);
    }
  }

  async function putConfig(patch) {
    var res = await fetch(CONFIG_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    var json = await res.json();
    return json.config || json;
  }

  function emitConfig(config) {
    try {
      window.dispatchEvent(new CustomEvent("dsh-pet-prince:config", { detail: config }));
    } catch (_) {}
  }

  function makeFactory(require) {
    var React = require("react");
    var h = React.createElement;
    var useState = React.useState;
    var useEffect = React.useEffect;
    var useRef = React.useRef;

    function clamp(n, min, max) {
      return Math.min(max, Math.max(min, n));
    }

    function SpriteFrame(props) {
      var cfg = props.cfg;
      var state = props.state;
      var frame = props.frame;
      var spec = ANIM[state] || ANIM.idle;
      var scale = (cfg.scale || 1) * DISPLAY;
      var width = FRAME_W * scale;
      var height = FRAME_H * scale;
      return h("div", {
        className: "dpp-sprite",
        role: "button",
        tabIndex: 0,
        title: "深海小王子 · 点击互动 / 右键菜单",
        "aria-label": "深海小王子桌宠",
        style: {
          width: width,
          height: height,
          backgroundImage: "url(" + SPRITE + ")",
          backgroundSize: FRAME_W * COLS * scale + "px " + FRAME_H * ROWS * scale + "px",
          backgroundPosition:
            "-" + frame * FRAME_W * scale + "px -" + spec.row * FRAME_H * scale + "px",
        },
        onPointerDown: props.onPointerDown,
        onPointerMove: props.onPointerMove,
        onPointerUp: props.onPointerUp,
        onPointerCancel: props.onPointerUp,
        onContextMenu: props.onContextMenu,
        onDoubleClick: function () {
          props.onAction("jumping");
        },
        onKeyDown: function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            props.onAction("waving");
          }
        },
      });
    }

    function Menu(props) {
      var menu = props.menu;
      if (!menu) return null;
      var left = Math.max(8, Math.min(menu.x, window.innerWidth - 170));
      var top = Math.max(8, Math.min(menu.y, window.innerHeight - 230));
      function item(label, action, danger) {
        return h(
          "button",
          {
            type: "button",
            className: danger ? "danger" : "",
            onPointerDown: function (event) {
              event.stopPropagation();
            },
            onClick: function () {
              action();
            },
          },
          label,
        );
      }
      return h(
        "div",
        {
          className: "dpp-menu",
          style: { left: left, top: top },
          onPointerDown: function (event) {
            event.stopPropagation();
          },
        },
        h("div", { className: "dpp-menu-title" }, "深海小王子"),
        item("挥手", function () { props.onAction("waving"); }, false),
        item("跳跃", function () { props.onAction("jumping"); }, false),
        item("等待", function () { props.onAction("waiting"); }, false),
        item("隐藏", function () { props.onHide(); }, false),
        item("复位位置", function () { props.onReset(); }, false),
      );
    }

    function Pet() {
      var cfgState = useState(null);
      var cfg = cfgState[0];
      var setCfg = cfgState[1];
      var stateState = useState("idle");
      var state = stateState[0];
      var setState = stateState[1];
      var frameState = useState(0);
      var frame = frameState[0];
      var setFrame = frameState[1];
      var menuState = useState(null);
      var menu = menuState[0];
      var setMenu = menuState[1];
      var posState = useState(readLocalPos);
      var pos = posState[0];
      var setPos = posState[1];
      var posRef = useRef(pos);
      var dragRef = useRef(null);
      var movedRef = useRef(false);

      useEffect(function () {
        var alive = true;
        getConfig().then(function (value) {
          if (alive) setCfg(value);
        });
        function onConfig(event) {
          if (event && event.detail) setCfg(event.detail);
        }
        window.addEventListener("dsh-pet-prince:config", onConfig);
        return function () {
          alive = false;
          window.removeEventListener("dsh-pet-prince:config", onConfig);
        };
      }, []);

      useEffect(function () {
        posRef.current = pos;
      }, [pos]);

      useEffect(function () {
        if (!cfg || !cfg.enabled) return;
        var spec = ANIM[state] || ANIM.idle;
        setFrame(0);
        var f = 0;
        var timer = setInterval(function () {
          f = (f + 1) % spec.frames;
          setFrame(f);
        }, spec.ms);
        return function () {
          clearInterval(timer);
        };
      }, [state, cfg]);

      useEffect(function () {
        if (!menu) return;
        function close() {
          setMenu(null);
        }
        window.addEventListener("pointerdown", close);
        return function () {
          window.removeEventListener("pointerdown", close);
        };
      }, [menu]);

      useEffect(function () {
        if (state !== "waving" && state !== "jumping" && state !== "failed" && state !== "review") return;
        var spec = ANIM[state];
        var timer = setTimeout(function () {
          setState("idle");
        }, spec.frames * spec.ms + 180);
        return function () {
          clearTimeout(timer);
        };
      }, [state]);

      if (!cfg || !cfg.enabled) return null;

      var scale = (cfg.scale || 1) * DISPLAY;
      var sizeW = FRAME_W * scale;
      var sizeH = FRAME_H * scale;
      var rootStyle = {
        width: sizeW,
        height: sizeH,
      };
      if (pos) {
        rootStyle.left = pos.x + "px";
        rootStyle.top = pos.y + "px";
      } else {
        if (cfg.corner.indexOf("left") >= 0) rootStyle.left = cfg.marginX + "px";
        else rootStyle.right = cfg.marginX + "px";
        if (cfg.corner.indexOf("top") >= 0) rootStyle.top = cfg.marginY + "px";
        else rootStyle.bottom = cfg.marginY + "px";
      }

      function action(next) {
        setMenu(null);
        setState(next);
      }

      async function hide() {
        setMenu(null);
        try {
          var next = await putConfig({ enabled: false });
          setCfg(next);
          emitConfig(next);
        } catch (_) {}
      }

      function reset() {
        setMenu(null);
        setPos(null);
        writeLocalPos(null);
      }

      function onPointerDown(event) {
        if (event.button !== 0) return;
        var rect = event.currentTarget.getBoundingClientRect();
        dragRef.current = {
          id: event.pointerId,
          startX: event.clientX,
          startY: event.clientY,
          x: rect.left,
          y: rect.top,
        };
        movedRef.current = false;
        if (event.currentTarget.setPointerCapture) {
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch (_) {}
        }
        event.preventDefault();
      }

      function onPointerMove(event) {
        var drag = dragRef.current;
        if (!drag || drag.id !== event.pointerId) return;
        var dx = event.clientX - drag.startX;
        var dy = event.clientY - drag.startY;
        if (!movedRef.current && Math.abs(dx) + Math.abs(dy) > 4) movedRef.current = true;
        if (!movedRef.current) return;
        var next = {
          x: clamp(drag.x + dx, -sizeW + 48, window.innerWidth - 48),
          y: clamp(drag.y + dy, 0, window.innerHeight - 48),
        };
        posRef.current = next;
        setPos(next);
      }

      function onPointerUp(event) {
        var drag = dragRef.current;
        if (!drag) return;
        dragRef.current = null;
        if (movedRef.current) {
          writeLocalPos(posRef.current);
        } else {
          setState("waving");
        }
      }

      function onContextMenu(event) {
        event.preventDefault();
        setMenu({ x: event.clientX, y: event.clientY });
      }

      return h(
        "div",
        { className: "dpp-root", style: rootStyle, "data-pet": "whale-prince" },
        h(
          "div",
          { className: "dpp-toolbar" },
          h("button", { type: "button", onClick: function () { action("waving"); } }, "挥手"),
          h("button", { type: "button", onClick: function () { action("jumping"); } }, "跳跃"),
          h("button", { type: "button", onClick: function () { action("waiting"); } }, "等待"),
          h("button", { type: "button", onClick: hide }, "隐藏"),
        ),
        h(SpriteFrame, {
          cfg: cfg,
          state: state,
          frame: frame,
          onPointerDown: onPointerDown,
          onPointerMove: onPointerMove,
          onPointerUp: onPointerUp,
          onContextMenu: onContextMenu,
          onAction: action,
        }),
        h(Menu, { menu: menu, onAction: action, onHide: hide, onReset: reset }),
      );
    }

    function Settings() {
      var cfgState = useState(null);
      var cfg = cfgState[0];
      var setCfg = cfgState[1];
      var msgState = useState("");
      var msg = msgState[0];
      var setMsg = msgState[1];

      useEffect(function () {
        var alive = true;
        getConfig().then(function (value) {
          if (alive) setCfg(value);
        });
        return function () {
          alive = false;
        };
      }, []);

      function set(key, value) {
        setCfg(Object.assign({}, cfg, { [key]: value }));
      }

      async function save() {
        try {
          var next = await putConfig(cfg);
          setCfg(next);
          emitConfig(next);
          setMsg("已保存，立即生效");
        } catch (error) {
          setMsg("保存失败：" + (error && error.message ? error.message : "未知错误"));
        }
      }

      async function reset() {
        var next = await putConfig(DEFAULTS);
        setCfg(next);
        emitConfig(next);
        setMsg("已恢复默认");
      }

      if (!cfg) return h("div", { className: "dpp-settings" }, "加载中…");

      return h(
        "div",
        { className: "dpp-settings" },
        h("h3", null, "深海小王子"),
        h("p", null, "2D 卡片式桌宠。点击挥手、拖动换位置、右键打开动作菜单；设置保存后立即生效。"),
        h(
          "div",
          { className: "dpp-card" },
          h(
            "label",
            { className: "dpp-check" },
            h("input", {
              type: "checkbox",
              checked: cfg.enabled,
              onChange: function (event) { set("enabled", event.target.checked); },
            }),
            "显示桌宠",
          ),
          h(
            "div",
            { className: "dpp-row" },
            h(
              "label",
              { className: "dpp-field" },
              h("span", null, "大小 · " + Math.round(cfg.scale * 100) + "%"),
              h("input", {
                type: "range",
                min: "0.6",
                max: "2.4",
                step: "0.05",
                value: cfg.scale,
                onChange: function (event) { set("scale", Number(event.target.value)); },
              }),
            ),
            h(
              "label",
              { className: "dpp-field" },
              h("span", null, "贴边位置"),
              h(
                "select",
                { value: cfg.corner, onChange: function (event) { set("corner", event.target.value); } },
                h("option", { value: "bottom-right" }, "右下"),
                h("option", { value: "bottom-left" }, "左下"),
                h("option", { value: "top-right" }, "右上"),
                h("option", { value: "top-left" }, "左上"),
              ),
            ),
            h(
              "label",
              { className: "dpp-field" },
              h("span", null, "水平边距 px"),
              h("input", {
                type: "number",
                value: cfg.marginX,
                onChange: function (event) { set("marginX", Number(event.target.value)); },
              }),
            ),
            h(
              "label",
              { className: "dpp-field" },
              h("span", null, "垂直边距 px"),
              h("input", {
                type: "number",
                value: cfg.marginY,
                onChange: function (event) { set("marginY", Number(event.target.value)); },
              }),
            ),
          ),
          h(
            "div",
            { className: "dpp-actions" },
            h("button", { className: "dpp-btn primary", type: "button", onClick: save }, "保存"),
            h("button", { className: "dpp-btn", type: "button", onClick: reset }, "恢复默认"),
            msg ? h("span", { className: "dpp-msg" }, msg) : null,
          ),
        ),
        h("span", { className: "dpp-badge" }, "dsh-pet-prince · v0.1.0"),
      );
    }

    var name = "pet-prince";
    var inject = ["slots"];

    function apply(ctx) {
      injectCss();
      ctx.slots.inject("shell.overlay", function* () {
        yield ctx.slots.register(
          { name: "shell.overlay", id: "pet-prince", order: 1000 },
          Pet,
        );
      });
      ctx.slots.inject("settings.section", function* () {
        yield ctx.slots.register(
          {
            name: "settings.section",
            id: "pet-prince-config",
            order: 31,
            label: function () { return "深海小王子"; },
          },
          Settings,
        );
      });
    }

    return { name: name, inject: inject, apply: apply };
  }

  window.__ModuleLoader__.load({
    id: ID,
    factory: function (require) {
      return makeFactory(require);
    },
  });
})();
