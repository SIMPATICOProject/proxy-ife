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

import javax.servlet.http.HttpServletRequest;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import eu.trentorise.smartcampus.profileservice.model.BasicProfile;

/**
 * @author raman
 *
 */
@Controller
public class UserApiController {


	@RequestMapping(value = "/userapi/ping", method = RequestMethod.GET)
	public @ResponseBody String ping(HttpServletRequest request) throws Exception {
		return "PONG";
	}

	@RequestMapping(value = "/userapi/profile", method = RequestMethod.GET)
	public @ResponseBody BasicProfile profile() throws Exception {
		BasicProfile basicProfile = (BasicProfile) SecurityContextHolder.getContext().getAuthentication().getDetails();
		return basicProfile;
	}
	
	
}
