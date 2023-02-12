var xpath = "//script[contains(text(),'appUid')]";
var node = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
var json = JSON.parse(node.innerText);
var userId = null;
var self = this;
findUser(json);

let followers = [{ id: '', username: '', fullname: '', picture: '' }];
let followings = [{ id: '', username: '', fullname: '', picture: '' }];
let dontFollowMeBack = [{ id: '', username: '', fullname: '', picture: '' }];
let iDontFollowBack = [{ id: '', username: '', fullname: '', picture: '' }];

followers = [];
followings = [];
dontFollowMeBack = [];
iDontFollowBack = [];

(async () => {
    try {
        let after = null;
        let has_next = true;

        while (has_next) {
            await fetch(
                `https://www.instagram.com/graphql/query/?query_hash=c76146de99bb02f6415203be841dd25a&variables=` +
                encodeURIComponent(
                    JSON.stringify({
                        id: userId,
                        include_reel: true,
                        fetch_mutual: true,
                        first: 50,
                        after: after,
                    })
                )
            ).then((res) => res.json()).then((res) => {
                has_next = res.data.user.edge_followed_by.page_info.has_next_page;
                after = res.data.user.edge_followed_by.page_info.end_cursor;
            
                followers = followers.concat(
                    res.data.user.edge_followed_by.edges.map(({ node }) => {
                        return {
                            id: node.id,
                            username: node.username,
                            fullname: node.full_name,
                            picture: node.profile_pic_url
                        };
                    })
                );
            });
        }

        console.log({ followers });

        after = null;
        has_next = true;

        while (has_next) {
            await fetch(
                `https://www.instagram.com/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables=` +
                encodeURIComponent(
                    JSON.stringify({
                        id: userId,
                        include_reel: true,
                        fetch_mutual: true,
                        first: 50,
                        after: after
                    })
                )
            ).then((res) => res.json()).then((res) => {
                has_next = res.data.user.edge_follow.page_info.has_next_page;
                after = res.data.user.edge_follow.page_info.end_cursor;
                
                followings = followings.concat(
                    res.data.user.edge_follow.edges.map(({ node }) => {
                        return {
                            id: node.id,
                            username: node.username,
                            fullname: node.full_name,
                            picture: node.profile_pic_url
                        };
                    })
                );
            });
        }

        console.log({ followings });

        dontFollowMeBack = followings.filter((following) => {
            return !followers.find(
                (follower) => follower.username === following.username
            );
        });

        console.log({ dontFollowMeBack });

        iDontFollowBack = followers.filter((follower) => {
            return !followings.find(
                (following) => following.username === follower.username
            );
        });

        console.log({ iDontFollowBack });
    } catch (err) {
        console.log({ err });
    }
})();

function findUser(object) {
    Object.entries(object).forEach((entry) => {
        const [key, value] = entry;

        if (self.userId !== null) {
            return;
        }

        if (key == 'appUid') {
            self.userId = value;
        } else if (typeof value === 'object' && value !== null || Array.isArray(value)) {
            findUser(value);
        }
    });
};