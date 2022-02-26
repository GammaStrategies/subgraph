import { test, assert } from "matchstick-as";
import { getOrCreateUser } from '../src/utils/entities'


test("Can get user", () => {
    const id = "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    getOrCreateUser(id, true)

    assert.fieldEquals(
        "User",
        id,
        "activeAccount",
        "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B"
    )
})
