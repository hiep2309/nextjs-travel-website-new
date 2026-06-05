# Food-to-Trip Ecosystem

Connects **AI Food Explorer** → **saved foods** → **profile** → **AI Trip Planner** → **personalized itinerary**.

## Firebase schema (`users/{uid}`)

```json
{
  "uid": "string",
  "savedFoods": [
    {
      "id": "pho-bo",
      "name": "Phở bò",
      "city": "Hà Nội",
      "image": "https://…",
      "category": "local_specialties",
      "priceRange": "budget",
      "description": "…",
      "savedAt": "<Timestamp>"
    }
  ],
  "tripFoods": [
    {
      "id": "pho-bo",
      "name": "Phở bò",
      "city": "Hà Nội",
      "image": "https://…",
      "addedAt": "<Timestamp>"
    }
  ]
}
```

### Analytics (`food_analytics/{id}`)

| Field | Description |
|-------|-------------|
| `userId` | Owner |
| `event` | `food_save` \| `trip_add` \| `ai_generation` |
| `foodId`, `foodName`, `destination`, `locale` | Optional context |
| `createdAt` | Server timestamp |

## Migration plan

1. **Deploy Firestore rules** — includes `food_analytics` create/read rules.
2. **No backfill required** — missing `savedFoods` / `tripFoods` normalize to `[]` on read.
3. **New users** — `createUserProfile` initializes empty arrays.
4. **Existing users** — first save/trip write merges arrays; optional one-time script:

   ```bash
   # Optional Admin SDK script: set savedFoods: [], tripFoods: [] where missing
   ```

5. **Publish rules** in Firebase Console or `firebase deploy --only firestore:rules`.

## AI Trip Planner

- Server loads `tripFoods[].name` via `getUserTripFoodNames(uid)`.
- Injected into Gemini prompt (`buildPrompt` → must-include block).
- Cache key includes sorted food names (`buildPlanCacheKey`).
- Response may include `local_food: string[]` on `TripPlan`.

## Routes

| Path | Page |
|------|------|
| `/[locale]/profile/saved-foods` | Favorite foods |
| `/[locale]/profile/trip-foods` | Trip queue for planner |

## Hooks

- `useSavedFoods` — realtime `savedFoods`
- `useTripFoods` — realtime `tripFoods`
- `useFoodActions` — save / add-to-trip + toasts + auth gate
- `useFoodRecommendations` — ranking state for Food Explorer
