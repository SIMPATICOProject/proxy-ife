/*******************************************************************************
 * Copyright 2015 Fondazione Bruno Kessler
 * 
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 * 
 *        http://www.apache.org/licenses/LICENSE-2.0
 * 
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 ******************************************************************************/
package eu.simpaticoproject.ife.controller;

import java.io.IOException;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import eu.trentorise.smartcampus.aac.AACService;
import eu.trentorise.smartcampus.aac.model.TokenData;
import eu.trentorise.smartcampus.network.JsonUtils;

/**
 * @author raman
 *
 */
@Controller
public class OAuthCallbackController {

	@Autowired
	private Environment env;
	private AACService service;
	@PostConstruct
	private void init() {
		service = new AACService(env.getProperty("aac.url"), env.getProperty("aac.clientId"),
				env.getProperty("aac.clientSecret"));
	}
	
	@RequestMapping("/callback")
	public void callback(HttpServletRequest request, HttpServletResponse response) {
		try {
			TokenData tokenData = service.exchngeCodeForToken(request.getParameter("code"),
					env.getProperty("aac.redirect"));
			response.sendRedirect("userloginsuccess#"
					+ JsonUtils.toJSON(tokenData));
		} catch (Exception e) {
			try {
				response.sendRedirect("userloginerror?error=" + e.getMessage());
			} catch (IOException e1) {
				e1.printStackTrace();
			}
		}
	}

	@RequestMapping("/userloginsuccess")
	public String success(HttpServletRequest request, HttpServletResponse response) throws IOException {
		return "userloginsuccess";
	}

}
