import Foundation

@objc public class CapacitorFirestore: NSObject {
    @objc public func echo(_ value: String) -> String {
        print(value)
        return value
    }
}
