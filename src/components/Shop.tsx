import { SHOP_ITEMS, SHOP_PRICE, type ShopItemId } from '../core/shop'

interface Props {
  ownedItems: ShopItemId[]
  onPurchase: (item: ShopItemId) => void
}

export function Shop({ ownedItems, onPurchase }: Props) {
  return (
    <section className="shop" aria-labelledby="shop-title">
      <header className="shop-heading">
        <span className="progress-label">Dictionquest</span>
        <h1 id="shop-title">Shop</h1>
        <p className="muted">Small perks to make each session a little smoother.</p>
      </header>

      <p className="shop-note" role="note">
        Prototype shop: purchases are simulated. No payment is taken. Each item is a permanent unlock for this saved game.
      </p>

      <div className="shop-items">
        {SHOP_ITEMS.map((item) => {
          const purchased = ownedItems.includes(item.id)
          return (
            <article className="shop-card" key={item.id}>
              <div className="shop-card-copy">
                <div className="shop-card-title">
                  <h2>{item.name}</h2>
                  {purchased && <span className="shop-owned">Owned</span>}
                </div>
                <p>{item.description}</p>
                <p className="shop-effect">{item.effect}</p>
              </div>
              <button
                type="button"
                className={purchased ? 'btn-outline shop-buy owned' : 'btn shop-buy'}
                disabled={purchased}
                onClick={() => onPurchase(item.id)}
                aria-label={purchased ? `${item.name}, owned` : `Mock purchase ${item.name} for €${SHOP_PRICE.toFixed(2)}`}
              >
                {purchased ? 'Owned' : `€${SHOP_PRICE.toFixed(2)}`}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}
