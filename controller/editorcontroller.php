<?php

namespace OCA\Onlyoffice\Controller;

use \OCP\AppFramework\Controller;
use \OCP\IRequest;
use \OCP\AppFramework\Http\TemplateResponse;
use \OCP\AppFramework\Http\JSONResponse;
use \OCP\ILogger;


class EditorController extends Controller {

    /**
     *
     * @NoAdminRequired
	 * @NoCSRFRequired
     */
	public function view($file){
		$response = new TemplateResponse($this->appName, 'editor', ['appName' => $this->appName, 'file' => $file, 'type' => 'view']);
		return $response;
	}

    /**
     *
     * @NoAdminRequired
	 * @NoCSRFRequired
     */
	public function edit($file){
		$response = new TemplateResponse($this->appName, 'editor', ['appName' => $this->appName, 'file' => $file, 'type' => 'edit']);
		return $response;
	}

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
	public function viewpl($file, $token){
		$response = new TemplateResponse($this->appName, 'editor', ['appName' => $this->appName, 'file' => $file, 'type' => 'view', 'pl_token' => $token]);
		return $response;
	}

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     * @PublicPage
     */
	public function editpl($file, $token){
		$response = new TemplateResponse($this->appName, 'editor', ['appName' => $this->appName, 'file' => $file, 'type' => 'edit', 'pl_token' => $token]);
		return $response;
	}
}
