<%
/**
 * Copyright (c) 2000-2006 Liferay, Inc. All rights reserved.
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
%>

<%@ include file="/html/portlet/workflow/init.jsp" %>

<%
ResultRow row = (ResultRow)request.getAttribute(WebKeys.SEARCH_CONTAINER_RESULT_ROW);

WorkflowTask task = (WorkflowTask)row.getObject();

String taskId = String.valueOf(task.getTaskId());

WorkflowInstance instance = task.getInstance();

String instanceId = String.valueOf(instance.getInstanceId());

WorkflowDefinition definition = instance.getDefinition();
%>

<c:if test="<%= !instance.isEnded() %>">
	<c:if test="<%= WorkflowTaskPermission.contains(permissionChecker, task, ActionKeys.PERMISSIONS) %>">
		<liferay-security:permissionsURL
			modelResource="<%= WorkflowTask.class.getName() %>"
			modelResourceDescription='<%= definition.getName() + " " + definition.getVersion() + ", " + LanguageUtil.get(pageContext, "instance") + " " + instance.getInstanceId() + ", " + task.getName() %>'
			resourcePrimKey="<%= taskId %>"
			var="permissionsURL"
		/>

		<liferay-ui:icon image="permissions" url="<%= permissionsURL %>" />
	</c:if>

	<c:if test="<%= task.getEndDate() == null %>">
		<c:if test="<%= WorkflowTaskPermission.contains(permissionChecker, task, ActionKeys.MANAGE) %>">
			<portlet:renderURL windowState="<%= WindowState.MAXIMIZED.toString() %>" var="manageTaskURL">
				<portlet:param name="struts_action" value="/workflow/edit_task" />
				<portlet:param name="redirect" value="<%= currentURL %>" />
				<portlet:param name="instanceId" value="<%= instanceId %>" />
				<portlet:param name="taskId" value="<%= taskId %>" />
			</portlet:renderURL>

			<liferay-ui:icon image="manage_task" message="manage" url="<%= manageTaskURL %>" />
		</c:if>
	</c:if>
</c:if>