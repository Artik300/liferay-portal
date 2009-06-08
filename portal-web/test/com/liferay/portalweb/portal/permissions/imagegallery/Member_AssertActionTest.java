/**
 * Copyright (c) 2000-2009 Liferay, Inc. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

package com.liferay.portalweb.portal.permissions.imagegallery;

import com.liferay.portalweb.portal.BaseTestCase;
import com.liferay.portalweb.portal.util.RuntimeVariables;

/**
 * <a href="Member_AssertActionTest.java.html"><b><i>View Source</i></b></a>
 *
 * @author Brian Wing Shun Chan
 *
 */
public class Member_AssertActionTest extends BaseTestCase {
	public void testMember_AssertAction() throws Exception {
		for (int second = 0;; second++) {
			if (second >= 60) {
				fail("timeout");
			}

			try {
				if (selenium.isElementPresent(
							"link=Image Gallery Permissions Test Page")) {
					break;
				}
			}
			catch (Exception e) {
			}

			Thread.sleep(1000);
		}

		selenium.click(RuntimeVariables.replace(
				"link=Image Gallery Permissions Test Page"));
		selenium.waitForPageToLoad("30000");
		assertFalse(selenium.isElementPresent("link=Configuration"));
		assertFalse(selenium.isElementPresent("link=Look and Feel"));
		assertFalse(selenium.isElementPresent("link=Export / Import"));
		assertFalse(selenium.isElementPresent("//img[@alt='Remove']"));
		assertFalse(selenium.isElementPresent("//input[@value='Add Folder']"));
		assertFalse(selenium.isElementPresent("//div[5]/ul/li[1]/a"));
		assertFalse(selenium.isElementPresent("//div[5]/ul/li[2]/a"));
		assertFalse(selenium.isElementPresent("//div[5]/ul/li[3]/a"));
		selenium.click(RuntimeVariables.replace("//b"));
		selenium.waitForPageToLoad("30000");
		assertFalse(selenium.isElementPresent("//input[@value='Add Subfolder']"));
		assertTrue(selenium.isElementPresent("//input[@value='Add Image']"));
		selenium.click(RuntimeVariables.replace(
				"link=Image Gallery Permissions Test Page"));
		selenium.waitForPageToLoad("30000");
		selenium.click(RuntimeVariables.replace("link=My Images"));
		selenium.waitForPageToLoad("30000");
		assertTrue(selenium.isTextPresent("Edited Third Permissions Image"));
		selenium.click(RuntimeVariables.replace("link=Recent Images"));
		selenium.waitForPageToLoad("30000");
		assertTrue(selenium.isTextPresent("Second Permissions Image Test"));
		assertTrue(selenium.isTextPresent("Edited Third Permissions Image"));
	}
}