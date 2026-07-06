# Firefox UserChrome.css and UserChrome.js
### My personal firefox customisation

## Inspector manual layout change
Inspector inside devtools - does not change into vertical when dragging beyond 1000px (userscript.js)

Adds a button to manually flip if needed
File is here: [JS/inspector-keep-horz.uc.mjs](/JS/inspector-keep-horz.uc.mjs)

<img width="1000" height="auto" alt="image" src="https://github.com/user-attachments/assets/6147ddaf-1ed6-4fe1-a586-df5760771308" />
<img width="400" height="auto" alt="image" src="https://github.com/user-attachments/assets/94b678c9-ed43-4624-a74b-5903753e417a" />

----

# Theme
<img width="1918" height="466" alt="image" src="https://github.com/user-attachments/assets/832e8dc5-19e8-496c-abea-c14c9bec2f56" />

### Hover on top (bookmark toolbar visible)
<img width="1915" height="524" alt="image" src="https://github.com/user-attachments/assets/5ffa3834-f804-4866-b345-0f0f6c9e2603" />

## The hover effect is done purely in css

Code for hover effect

```css
toolbox#navigator-toolbox.chrome-block {
  filter: brightness(75%);
  height: 5%;
  transition: filter 0.35s ease, height 0.35s ease;
  transition-delay: 0.5s;
}
toolbox#navigator-toolbox.chrome-block:hover {
  filter: brightness(100%);
  height: 7.5%;
  transition: filter 0.35s ease, height 0.3s ease;
	transition-delay: 0.1s;
}
```

