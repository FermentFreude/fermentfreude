/**
 * @payloadcms/plugin-ecommerce's EcommerceProvider restores a cart from
 * localStorage (or from the logged-in user's own `cart` relationship) on
 * every mount, but never checks the fetched cart's `status`. A GET on an
 * already-purchased cart succeeds (200, `status: 'purchased'`) — it isn't
 * a 404/403, so the provider's only self-clearing logic (its fetch-failure
 * `.catch()`) never fires. The stale, already-purchased cart ID just gets
 * loaded right back into state and localStorage, and every further action
 * against it (add another item, go to checkout) permanently dead-ends on
 * "This cart has already been paid for" with no recovery path short of the
 * user manually clearing their browser storage.
 *
 * This app has no custom CartProvider to fix this in app code — the
 * plugin's own React provider is used directly (src/providers/index.tsx) —
 * and its only exposed reset function, `clearSession()`, is too broad for
 * this (it also logs the user out of the ecommerce session and clears
 * their saved addresses, which is wrong UX for "let me start a new cart").
 * So this patches the provider directly: a purchased cart is now treated
 * the same as a failed fetch — state and localStorage are cleared instead
 * of loading the dead cart, so the next add-to-cart naturally starts fresh.
 *
 * Re-applied on postinstall because node_modules is not committed.
 */
import fs from 'fs'
import path from 'path'

const providerPath = path.join(
  process.cwd(),
  'node_modules/@payloadcms/plugin-ecommerce/dist/react/provider/index.js',
)

if (!fs.existsSync(providerPath)) {
  console.warn('[patch-ecommerce-purchased-cart] @payloadcms/plugin-ecommerce not found — skip')
  process.exit(0)
}

let content = fs.readFileSync(providerPath, 'utf8')

const alreadyPatchedMarker = '/* [patch-ecommerce-purchased-cart] */'
if (content.includes(alreadyPatchedMarker)) {
  process.exit(0)
}

// ── Patch 1: localStorage-restore path ──────────────────────────────────
const before1 = `                if (storedCartID) {
                    getCart(storedCartID, {
                        secret: storedSecret || undefined
                    }).then((fetchedCart)=>{
                        setCart(fetchedCart);
                        setCartID(storedCartID);
                        if (storedSecret) {
                            setCartSecret(storedSecret);
                        }
                    }).catch((_)=>{`

const after1 = `                if (storedCartID) {
                    getCart(storedCartID, {
                        secret: storedSecret || undefined
                    }).then((fetchedCart)=>{
                        ${alreadyPatchedMarker}
                        if (fetchedCart && fetchedCart.status === 'purchased') {
                            localStorage.removeItem(localStorageConfig.key);
                            localStorage.removeItem(\`\${localStorageConfig.key}_secret\`);
                            setCartID(undefined);
                            setCart(undefined);
                            setCartSecret(undefined);
                            return;
                        }
                        setCart(fetchedCart);
                        setCartID(storedCartID);
                        if (storedSecret) {
                            setCartSecret(storedSecret);
                        }
                    }).catch((_)=>{`

// ── Patch 2: logged-in user's own cart path ──────────────────────────────
const before2 = `                        getCart(cartID).then((fetchedCart)=>{
                            setCart(fetchedCart);
                            setCartID(cartID);
                        }).catch((error)=>{`

const after2 = `                        getCart(cartID).then((fetchedCart)=>{
                            if (fetchedCart && fetchedCart.status === 'purchased') {
                                setCart(undefined);
                                setCartID(undefined);
                                return;
                            }
                            setCart(fetchedCart);
                            setCartID(cartID);
                        }).catch((error)=>{`

// ── Patch 3: clearCart() itself ──────────────────────────────────────────
// The app calls clearCart() right after a successful purchase
// (ConfirmOrder.tsx) intending to detach from the now-completed cart. But
// clearCart() only empties the SAME cart's items via POST .../clear and
// keeps cartID pointed at it — it never resets cartID/cartSecret. Since the
// cart is already marked 'purchased' by that point, this left the provider
// (and localStorage) pointed at a dead, purchased cart for the rest of the
// browser session: the very next add-to-cart or checkout attempt in the
// same tab hit "This cart has already been paid for" with no recovery.
const before3 = `            // Refresh cart with proper depth/populate settings for UI
            const refreshedCart = await getCart(cartID, {
                secret: cartSecret
            });
            setCart(refreshedCart);
        } catch (error) {
            if (debug) {
                // eslint-disable-next-line no-console
                console.error('Error clearing cart:', error);
            }
        } finally{
            setIsLoading(false);
        }
    }, [
        baseAPIURL,
        cartID,
        cartSecret,
        cartsSlug,
        debug,
        getCart
    ]);`

const after3 = `            // Refresh cart with proper depth/populate settings for UI
            const refreshedCart = await getCart(cartID, {
                secret: cartSecret
            });
            if (refreshedCart && refreshedCart.status === 'purchased') {
                if (syncLocalStorage) {
                    localStorage.removeItem(localStorageConfig.key);
                    localStorage.removeItem(\`\${localStorageConfig.key}_secret\`);
                }
                setCartID(undefined);
                setCart(undefined);
                setCartSecret(undefined);
            } else {
                setCart(refreshedCart);
            }
        } catch (error) {
            if (debug) {
                // eslint-disable-next-line no-console
                console.error('Error clearing cart:', error);
            }
        } finally{
            setIsLoading(false);
        }
    }, [
        baseAPIURL,
        cartID,
        cartSecret,
        cartsSlug,
        debug,
        getCart,
        localStorageConfig.key,
        syncLocalStorage
    ]);`

if (!content.includes(before1) || !content.includes(before2) || !content.includes(before3)) {
  console.warn(
    '[patch-ecommerce-purchased-cart] Expected block(s) not found — plugin version may have changed, manual check needed',
  )
  process.exit(0)
}

content = content.replace(before1, after1).replace(before2, after2).replace(before3, after3)
fs.writeFileSync(providerPath, content)
console.log('[patch-ecommerce-purchased-cart] Purchased carts now self-clear instead of dead-ending')
