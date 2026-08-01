# Little Light - Design Specification

## 1. Design Tokens

### 1.1 Colors

| Token | Value | Name | Usage |
|-------|-------|------|-------|
| bg | #FAF8F4 | Cream White | Page background |
| primary | #A8CFA8 | Sage Green | Primary brand color |
| secondary | #D9E8D5 | Forest Light Green | Secondary/background accents |
| button | #7EA68A | Deep Sage | Primary button color |
| text | #4B4B4B | Deep Gray | Body text |
| card | #FFFFFF | White | Card background |
| border | #EBEBEB | Light Gray | Dividers, borders |

### 1.2 Typography

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 32px | SemiBold (600) | 1.3 |
| H2 | 24px | SemiBold (600) | 1.3 |
| H3 | 20px | SemiBold (600) | 1.4 |
| Body | 15px | Regular (400) | 1.6 |
| Small | 14px | Regular (400) | 1.5 |
| Caption | 12px | Regular (400) | 1.4 |

**Font Family:**
- English: Inter
- Chinese: HarmonyOS Sans / Source Han Sans

### 1.3 Spacing

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Tiny gaps |
| sm | 8px | Small gaps |
| md | 16px | Medium gaps |
| lg | 24px | Large gaps |
| xl | 32px | Extra large gaps |

### 1.4 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| sm | 8px | Small elements |
| md | 12px | Inputs, cards |
| lg | 16px | Large cards |
| xl | 20px | Main cards, buttons |
| round | 24px | Circular buttons |

### 1.5 Shadows

| Token | Value | Usage |
|-------|-------|-------|
| soft | 0 2px 12px rgba(0,0,0,0.04) | Cards |
| medium | 0 4px 16px rgba(0,0,0,0.06) | Elevated cards |
| focus | 0 0 0 3px rgba(168,207,168,0.2) | Focus state |

## 2. Component Specifications

### 2.1 Gentle Button

```
Height: 48px
Padding: 14px 28px
Border Radius: 24px
Background: #7EA68A (button)
Text: #FFFFFF, 16px, Medium (500)
Hover: scale 0.98
Active: scale 0.96
Transition: all 0.2s ease
```

### 2.2 Card

```
Background: #FFFFFF (card)
Border Radius: 20px
Padding: 20px
Shadow: soft
Margin Bottom: 16px
```

### 2.3 Input Field

```
Height: 48px
Padding: 14px 20px
Border Radius: 24px
Border: 1px solid #EBEBEB (border)
Background: #FFFFFF (card)
Font: 15px, Regular
Focus: border #A8CFA8, shadow focus
Transition: all 0.3s ease
```

### 2.4 Message Bubble

**AI Message:**
```
Background: #D9E8D5 (secondary)
Border Radius: 18px 18px 18px 4px
Padding: 12px 16px
Max Width: 80%
Align: Left
```

**User Message:**
```
Background: #7EA68A (button)
Text: #FFFFFF
Border Radius: 18px 18px 4px 18px
Padding: 12px 16px
Max Width: 80%
Align: Right
```

### 2.5 Mood Selector

```
Width: 64px
Height: 64px
Border Radius: 50%
Background: #FFFFFF (card)
Font Size: 28px
Shadow: 0 2px 8px rgba(0,0,0,0.06)
Hover: scale 1.05
Active: background #D9E8D5 (secondary), scale 1.1
Transition: all 0.2s ease
```

### 2.6 Nav Item

```
Width: 60px
Flex Direction: Column
Gap: 4px
Font Size: 12px
Icon Size: 20px
Opacity: 0.5 (inactive), 1 (active)
Color: #4B4B4B (inactive), #7EA68A (active)
Transition: all 0.2s ease
```

## 3. Page Layouts

### 3.1 Splash Screen

```
┌─────────────────────────────┐
│ ☁️ (cloudFloat 6s)          │
│ ☁️ (cloudFloat 8s)          │
│ ☁️ (cloudFloat 7s)          │
│                             │
│  ✨ (pulse)                  │
│  ⭐ (pulse 1s delay)         │
│  🌟 (pulse 2s delay)         │
│                             │
│        🌙 (float 4s)         │
│                             │
│      Little Light           │
│    H1, 32px, SemiBold       │
│                             │
│ A small light...            │
│ Body, 16px, opacity 0.7     │
│                             │
│ No one should...            │
│ Small, 14px, opacity 0.5    │
└─────────────────────────────┘
```

### 3.2 Home Screen

```
┌─────────────────────────────┐
│          🌙                 │
│      Good Evening.          │
│    H2, 24px, SemiBold       │
│                             │
│ How are you feeling today?  │
│ Body, 15px, opacity 0.7     │
│                             │
│   😊   🙂   😔   😭          │
│  MoodSelector x4           │
│                             │
│ ─────────────────────────── │
│                             │
│  Take your time.            │
│  I'm here to listen.        │
│  Subtitle, 14px, opacity 0.6│
│                             │
│    [ Talk with Lumi ]       │
│    GentleButton             │
│                             │
│ ─────────────────────────── │
│                             │
│ ┌───────────────────────┐   │
│ │ 📝 Today's Journal   │   │
│ │ What happened today? │   │
│ │ [ Textarea ]         │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ 🌱 Little Journey     │   │
│ │ Day 6                │   │
│ │ [======      ] 20%   │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ 💫                    │   │
│ │ "The sky doesn't..."  │   │
│ │ — Today's reminder    │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

### 3.3 Chat Screen

```
┌─────────────────────────────┐
│ ← 🐱 Lumi                  │
│ Back + Avatar + Title       │
│                             │
│ ┌───────────────────────┐   │
│ │ Hi, I'm Lumi...       │   │
│ │ [AI Bubble]           │   │
│ ├───────────────────────┤   │
│ │ User message...       │   │
│ │ [User Bubble]         │   │
│ ├───────────────────────┤   │
│ │ ...                   │   │
│ └───────────────────────┘   │
│                             │
│ ┌─────────────┐ ┌──────┐    │
│ │ [Input]     │ │Send  │    │
│ │ placeholder │ │Button│    │
│ └─────────────┘ └──────┘    │
└─────────────────────────────┘
```

### 3.4 Mood Journal Screen

```
┌─────────────────────────────┐
│ ← Mood Journal             │
│                             │
│      1                      │
│  How are you feeling?      │
│  Select one that feels...  │
│                             │
│ ┌───────┐ ┌───────┐        │
│ │ 😊    │ │ 🙂    │        │
│ │ Happy │ │ Calm  │        │
│ ├───────┤ ├───────┤        │
│ │ 😔    │ │ 😭    │        │
│ │ Sad   │ │Overwhelmed│    │
│ └───────┘ └───────┘        │
│                             │
│      2                      │
│  What's weighing on you?   │
│                             │
│ ┌───────┐ ┌───────┐        │
│ │ Work  │ │ Money │        │
│ ├───────┤ ├───────┤        │
│ │Family │ │Rel... │        │
│ ├───────┤ ├───────┤        │
│ │Health │ │ Other │        │
│ └───────┘ └───────┘        │
│                             │
│      3                      │
│  A little gratitude        │
│                             │
│ ┌───────────────────────┐   │
│ │ Today, I'm grateful..│   │
│ │ [Textarea 120px]     │   │
│ └───────────────────────┘   │
│                             │
│    [ Save Journal ]        │
└─────────────────────────────┘
```

### 3.5 Journey Screen

```
┌─────────────────────────────┐
│ ← Little Journey           │
│                             │
│         🌱                 │
│     30 Days of Restart     │
│                             │
│ [=================      ]  │
│ Day 6 / 30    20% Complete │
│                             │
│ Your Journey               │
│                             │
│ 1 2 3 4 5 6 7 8 9 10       │
│ [×][×][×][×][×][●][○]...   │
│ completed/current/locked   │
│                             │
│ ┌───────────────────────┐   │
│ │ Today's Task          │   │
│ │ Take three deep...    │   │
│ │ [ Mark Complete ]     │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

### 3.6 Community Screen

```
┌─────────────────────────────┐
│ ← Tree Hole                │
│                             │
│ ┌───────────────────────┐   │
│ │ Anonymous Sharing     │   │
│ │ Share your thoughts.. │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ 🐰 Anonymous Friend   │   │
│ │ 2 hours ago           │   │
│ │ I feel so tired...    │   │
│ │ ┌─────────────────┐   │   │
│ │ │ Lumi's Reply    │   │   │
│ │ │ I'm so sorry... │   │   │
│ │ └─────────────────┘   │   │
│ │ 🤗 Hug  💝 Encourage │   │
│ └───────────────────────┘   │
│                             │
│ (More posts...)            │
└─────────────────────────────┘
```

### 3.7 Profile Screen

```
┌─────────────────────────────┐
│ ← My Profile               │
│                             │
│         🐰                 │
│      Dear Friend           │
│   Your gentle companion..  │
│                             │
│ ┌───────┐ ┌───────┐ ┌─────┐│
│ │  12   │ │  7    │ │  48 ││
│ │Days   │ │Streak │ │Journ││
│ └───────┘ └───────┘ └─────┘│
│                             │
│ ┌───────────────────────┐   │
│ │ Mood Trends           │   │
│ │ ▮▮▮▮▮▮▮               │   │
│ └───────────────────────┘   │
│                             │
│ ┌───────────────────────┐   │
│ │ "You are doing..."    │   │
│ │ Your daily quote      │   │
│ └───────────────────────┘   │
└─────────────────────────────┘
```

## 4. Navigation Bar

```
┌─────────────────────────────┐
│  🏠    💬    📝    🌳    👤  │
│ Home Chat Journal Comm Prof │
│                              │
│ Height: 60px                │
│ Background: #FFFFFF         │
│ Border Top: 1px #EBEBEB     │
└─────────────────────────────┘
```

## 5. Animation Specifications

### 5.1 Page Transitions

```
fadeIn: 0.4s ease-out
from: opacity 0, translateY 10px
to: opacity 1, translateY 0
```

### 5.2 Button Interactions

```
Hover: scale 0.98
Active: scale 0.96
Transition: all 0.2s ease
```

### 5.3 Lumi Typing Animation

```
Speed: 50ms per character
Effect: typeWriter逐字显示
```

### 5.4 Particle Effect (Task Complete)

```
Particles: 🍃, 🌿, 🌸, ✨, 🌼
Count: 15
Duration: 4s
Animation: particleFall (rotate + fade out)
```

### 5.5 Tree Growth Animation

```
treeGrow: 1s ease-out
0%: scale 0.5, opacity 0
50%: scale 1.1, opacity 1
100%: scale 1, opacity 1
```

## 6. Mood-Based Background Colors

| Mood | Color | Description |
|------|-------|-------------|
| 😊 Happy | #F0F5F8 | Slightly blue tint |
| 🙂 Calm | #FAF8F4 | Default cream |
| 😔 Sad | #F2F4F0 | Grey-green tint |
| 😭 Overwhelmed | #F4F0F2 | Pinkish tint |

## 7. Language Support

- English (Primary)
- Finnish (Secondary)

All key UI strings should be externalized for localization.