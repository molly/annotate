(ns scripts.util)

;; https://gist.github.com/danielpcox/c70a8aa2c36766200a95?permalink_comment_id=2711849#gistcomment-2711849
(defn deep-merge [& maps]
  (apply merge-with (fn [& args]
                      (if (every? map? args)
                        (apply deep-merge args)
                        (last args)))
         maps))
