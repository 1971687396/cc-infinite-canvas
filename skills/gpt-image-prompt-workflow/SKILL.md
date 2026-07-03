---
name: gpt-image-prompt-workflow
description: Build reusable GPT Image / GPT Image 2 prompt workflows and prompt templates. Use when the user wants image-generation prompts, parameterized prompt templates, stable visual series, prompt diagnosis, prompt iteration, or a structured workflow that turns vague image ideas into reliable image prompts.
---

# GPT Image Prompt Workflow

Treat ChatGPT as a visual planning assistant, not only a prompt generator. Do not rush straight to a final prompt when the idea is vague. First turn the idea into clear parameters, then expand those parameters into a stable prompt.

Source inspiration:
- https://x.com/liyue_ai/status/2062159102298759506
- https://x.com/liyue_ai/status/2070046006021161467

## Core Principles

Use one main visual direction per image. Avoid mixing many conflicting styles, scenes, outfits, identities, or moods in the same prompt.

Prefer accurate parameters over many parameters. A short, clear parameter set is better than a crowded prompt.

Separate fixed rules from variable inputs. Fixed rules preserve the visual system; variable inputs let the user create different images in the same style.

Make prompts modular so problems can be repaired by editing the relevant module instead of rewriting everything.

## Workflow

1. Clarify the image idea:
   - Subject: person, product, place, poster, scene, object, or brand.
   - Use case: single image, series, social post, product mockup, character design, poster, ad, cover, etc.
   - Main style: one dominant style only.
   - Visual focus: what must be noticed first.
   - Stable elements: what must stay consistent across generations.
   - Variable elements: what may change between versions.
   - Avoid list: what must not appear.

2. Judge whether the idea should become a reusable template:
   - Check whether the theme can support multiple scenes or variants.
   - Identify which elements must be locked.
   - Identify which elements can be opened for AI completion.
   - Name likely failure points before writing the final prompt.

3. Convert the idea into modules:
   - Image ratio
   - Subject
   - Main style
   - Scene
   - Composition
   - Pose or object state
   - Clothing, product details, or material
   - Color strategy
   - Lighting
   - Background
   - Mood
   - Camera/lens/framing
   - Texture/detail level
   - Negative constraints
   - Output format

4. If the user is unsure, recommend 4-6 parameter combinations first. Make each option clearly different in scene, color, mood, composition, and detail, while keeping them inside the same visual system.

5. After one option is selected or inferred, generate the final prompt.

## Parameter Intake Formula

When the user gives only a rough idea, convert it into this structure:

```text
I want a [ratio] image.
The subject is [subject].
The main style is [single visual style].
The scene is [specific environment].
The subject state is [pose/action/composition].
The visual atmosphere is [lighting/color/filter].
The intended feeling is [final impression].
Avoid [unwanted issues].
```

## Prompt Template Structure

When asked to create a reusable prompt template, include these parts:

1. Fixed aesthetic skeleton
   Define the stable visual identity, such as realism, illustration, product style, cinematic style, editorial style, brand tone, or series look.

2. User input parameters
   Keep the user-facing parameters simple. Include only the fields the user should actually control.

3. Auto-completion rules
   Let ChatGPT fill in supporting details such as material, lighting nuance, background depth, camera language, texture, and consistency rules.

4. Negative constraints
   Write constraints specific to the image type. Avoid generic-only negatives like "bad quality." Target the common failure modes.

5. Final output format
   Return the locked parameters, completed prompt, negative prompt, and testing advice.

## Output Format

Use this format by default:

```text
## 参数锁定
- 画幅比例：
- 主体：
- 主风格：
- 场景：
- 构图：
- 光线：
- 色彩：
- 氛围：
- 必须固定：
- 可变化：
- 避免：

## 自动补全
说明你补全了哪些细节，以及为什么这些补全不会破坏主风格。

## 最终提示词
输出一条可以直接用于 GPT Image / GPT Image 2 的完整中文提示词。

## 负面约束
列出具体、可执行的负面约束。

## 测试建议
说明生成后应该检查哪些稳定性问题，以及如果不满意应该改哪个参数模块。
```

## Iteration Rules

When the generated image is unsatisfactory, diagnose by module:

- Style wrong: adjust main style, lighting, color, texture.
- Subject wrong: adjust identity, shape, face/body/product description, visual focus.
- Pose or action wrong: simplify movement and clarify composition.
- Clothing or material wrong: specify color, material, silhouette, and what not to add.
- Background distracting: reduce background complexity and strengthen depth/blur rules.
- Series inconsistent: lock fixed aesthetic skeleton and reduce variable parameters.
- Low-quality AI look: strengthen realism, lighting, anatomy/object integrity, and negative constraints.

Do not rewrite the whole prompt unless the core idea changed.
