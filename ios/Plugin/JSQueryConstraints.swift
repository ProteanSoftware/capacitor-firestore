//
//  JSQueryConstraints.swift
//  Plugin
//
//  Created by Ashley Medway on 08/06/2022.
//  Copyright © 2022 All rights reserved.
//

import Foundation

@objc public class JSQueryConstraints: NSObject {
    public let fieldPath: String
    public let operation: String
    public let value: Any

    init(fieldPath: String, operation: String, value: Any) {
        self.fieldPath = fieldPath
        self.operation = operation
        self.value = value
    }
}
